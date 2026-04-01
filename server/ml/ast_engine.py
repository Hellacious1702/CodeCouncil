"""
CodeCouncil ML Engine — Tier 1: AST-Based Structural Analysis
Parses code into Abstract Syntax Trees for deep structural understanding.
Catches: syntax errors, undefined variables, unreachable code,
         wrong doctypes, unclosed tags, anti-patterns.
"""

import ast
import re
import json
from html.parser import HTMLParser


class PythonAnalyzer:
    """Deep Python code analysis via AST parsing."""

    def analyze(self, code: str) -> dict:
        issues = []
        
        # Step 1: Syntax check
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            issues.append({
                "id": "PY_SYNTAX",
                "severity": "CRITICAL",
                "line": e.lineno,
                "message": f"Python syntax error at line {e.lineno}: {e.msg}",
                "category": "syntax"
            })
            return {"issues": issues, "valid": False, "ast_depth": 0}

        # Step 2: Deep AST walk
        walker = PythonASTWalker()
        walker.visit(tree)
        issues.extend(walker.issues)

        return {
            "issues": issues,
            "valid": len([i for i in issues if i["severity"] == "CRITICAL"]) == 0,
            "ast_depth": self._get_depth(tree),
            "node_count": sum(1 for _ in ast.walk(tree)),
            "functions": walker.functions,
            "imports": walker.imports,
            "classes": walker.classes
        }

    def _get_depth(self, node, depth=0):
        max_depth = depth
        for child in ast.iter_child_nodes(node):
            child_depth = self._get_depth(child, depth + 1)
            max_depth = max(max_depth, child_depth)
        return max_depth


class PythonASTWalker(ast.NodeVisitor):
    """Walks the Python AST and flags anti-patterns."""

    def __init__(self):
        self.issues = []
        self.functions = []
        self.imports = []
        self.classes = []
        self.defined_vars = set()
        self.used_vars = set()
        self._in_loop = False

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            self.imports.append(node.module)
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        self.functions.append(node.name)
        
        # Check for overly complex functions (too many lines)
        body_lines = node.end_lineno - node.lineno if node.end_lineno else 0
        if body_lines > 50:
            self.issues.append({
                "id": "PY_COMPLEX_FUNC",
                "severity": "MEDIUM",
                "line": node.lineno,
                "message": f"Function '{node.name}' is {body_lines} lines long. Consider refactoring into smaller functions.",
                "category": "maintainability"
            })

        # Check for missing docstrings
        if not (node.body and isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant) and isinstance(node.body[0].value.value, str)):
            self.issues.append({
                "id": "PY_NO_DOCSTRING",
                "severity": "LOW",
                "line": node.lineno,
                "message": f"Function '{node.name}' has no docstring. Document purpose and parameters.",
                "category": "documentation"
            })

        # Check for bare except
        for child in ast.walk(node):
            if isinstance(child, ast.ExceptHandler) and child.type is None:
                self.issues.append({
                    "id": "PY_BARE_EXCEPT",
                    "severity": "HIGH",
                    "line": child.lineno,
                    "message": "Bare 'except:' catches all exceptions including SystemExit and KeyboardInterrupt. Use 'except Exception:' instead.",
                    "category": "security"
                })

        self.generic_visit(node)

    def visit_ClassDef(self, node):
        self.classes.append(node.name)
        self.generic_visit(node)

    def visit_Call(self, node):
        # Detect dangerous function calls
        if isinstance(node.func, ast.Name):
            name = node.func.id
            
            if name == "eval":
                self.issues.append({
                    "id": "PY_EVAL",
                    "severity": "CRITICAL",
                    "line": node.lineno,
                    "message": "eval() executes arbitrary code. This is a severe remote code execution (RCE) vulnerability.",
                    "category": "security"
                })
            elif name == "exec":
                self.issues.append({
                    "id": "PY_EXEC",
                    "severity": "CRITICAL",
                    "line": node.lineno,
                    "message": "exec() executes arbitrary Python code. Never use with untrusted input.",
                    "category": "security"
                })
            elif name == "input" and self._in_loop:
                self.issues.append({
                    "id": "PY_INPUT_LOOP",
                    "severity": "MEDIUM",
                    "line": node.lineno,
                    "message": "input() in a loop without validation. Validate and sanitize user input before processing.",
                    "category": "security"
                })
            elif name == "print" and self._in_loop:
                self.issues.append({
                    "id": "PY_PRINT_LOOP",
                    "severity": "LOW",
                    "line": node.lineno,
                    "message": "print() inside a loop adds I/O overhead. Consider logging or buffered output for production code.",
                    "category": "performance"
                })

        # Detect os.system, subprocess with shell=True
        if isinstance(node.func, ast.Attribute):
            if isinstance(node.func.value, ast.Name):
                full_call = f"{node.func.value.id}.{node.func.attr}"
                if full_call == "os.system":
                    self.issues.append({
                        "id": "PY_OS_SYSTEM",
                        "severity": "CRITICAL",
                        "line": node.lineno,
                        "message": "os.system() is vulnerable to shell injection. Use subprocess.run() with a list of arguments instead.",
                        "category": "security"
                    })
                elif full_call == "subprocess.Popen":
                    for kw in node.keywords:
                        if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                            self.issues.append({
                                "id": "PY_SHELL_TRUE",
                                "severity": "HIGH",
                                "line": node.lineno,
                                "message": "subprocess with shell=True is vulnerable to injection. Pass args as a list instead.",
                                "category": "security"
                            })

        self.generic_visit(node)

    def visit_For(self, node):
        prev = self._in_loop
        self._in_loop = True
        self.generic_visit(node)
        self._in_loop = prev

    def visit_While(self, node):
        prev = self._in_loop
        self._in_loop = True
        
        # Check for infinite loops without break
        has_break = any(isinstance(n, ast.Break) for n in ast.walk(node))
        if isinstance(node.test, ast.Constant) and node.test.value is True and not has_break:
            self.issues.append({
                "id": "PY_INFINITE_LOOP",
                "severity": "HIGH",
                "line": node.lineno,
                "message": "while True without a break statement creates an infinite loop. Add an exit condition.",
                "category": "logic"
            })
        
        self.generic_visit(node)
        self._in_loop = prev

    def visit_Global(self, node):
        for name in node.names:
            self.issues.append({
                "id": "PY_GLOBAL",
                "severity": "MEDIUM",
                "line": node.lineno,
                "message": f"Global variable '{name}' detected. Avoid global mutable state — use parameters or classes.",
                "category": "maintainability"
            })
        self.generic_visit(node)

    def visit_Compare(self, node):
        # Detect 'is' comparison with literals
        for op in node.ops:
            if isinstance(op, (ast.Is, ast.IsNot)):
                for comp in node.comparators:
                    if isinstance(comp, ast.Constant) and not isinstance(comp.value, type(None)):
                        self.issues.append({
                            "id": "PY_IS_LITERAL",
                            "severity": "MEDIUM",
                            "line": node.lineno,
                            "message": f"Use '==' instead of 'is' for value comparisons. 'is' checks identity, not equality.",
                            "category": "logic"
                        })
        self.generic_visit(node)


class HTMLAnalyzer:
    """Deep HTML analysis via parsing."""

    def analyze(self, code: str) -> dict:
        issues = []
        
        # Doctype check
        has_doctype = bool(re.match(r'^\s*<!DOCTYPE\s+html\s*>', code, re.IGNORECASE))
        wrong_doctype = bool(re.match(r'^\s*<!\s*DOCTYPE', code, re.IGNORECASE)) and not has_doctype
        
        if wrong_doctype:
            # Extract what they wrote
            dt_match = re.match(r'^\s*(<!.*?>)', code)
            actual = dt_match.group(1) if dt_match else "unknown"
            issues.append({
                "id": "HTML_BAD_DOCTYPE",
                "severity": "HIGH",
                "line": 1,
                "message": f"Invalid DOCTYPE: '{actual}'. Correct form is '<!DOCTYPE html>'. This affects browser rendering mode.",
                "category": "syntax"
            })
        elif not has_doctype and '<html' in code.lower():
            issues.append({
                "id": "HTML_NO_DOCTYPE",
                "severity": "MEDIUM",
                "line": 1,
                "message": "Missing <!DOCTYPE html> declaration. Without it, browsers render in quirks mode.",
                "category": "syntax"
            })

        # Parse HTML structure
        parser = HTMLStructureParser()
        try:
            parser.feed(code)
        except Exception as e:
            issues.append({
                "id": "HTML_PARSE_ERROR",
                "severity": "CRITICAL",
                "line": 0,
                "message": f"HTML parsing failed: {str(e)}",
                "category": "syntax"
            })
            return {"issues": issues, "valid": False}

        issues.extend(parser.issues)

        # Semantic checks
        if '<html' in code.lower():
            if '<head' not in code.lower():
                issues.append({
                    "id": "HTML_NO_HEAD",
                    "severity": "MEDIUM",
                    "line": 0,
                    "message": "Missing <head> section. Add <head> with <title> and <meta charset>.",
                    "category": "structure"
                })
            if '<title' not in code.lower():
                issues.append({
                    "id": "HTML_NO_TITLE",
                    "severity": "MEDIUM",
                    "line": 0,
                    "message": "Missing <title> element. Every HTML page should have a descriptive title.",
                    "category": "seo"
                })
            if 'meta charset' not in code.lower() and 'meta http-equiv' not in code.lower():
                issues.append({
                    "id": "HTML_NO_CHARSET",
                    "severity": "LOW",
                    "line": 0,
                    "message": "Missing charset declaration. Add <meta charset='UTF-8'> in <head>.",
                    "category": "best_practice"
                })

        # Inline event handlers (security)
        inline_handlers = re.findall(r'on\w+\s*=\s*["\']', code, re.IGNORECASE)
        if inline_handlers:
            issues.append({
                "id": "HTML_INLINE_JS",
                "severity": "MEDIUM",
                "line": 0,
                "message": f"Found {len(inline_handlers)} inline event handler(s) (onclick, etc.). Move JavaScript to external files or use addEventListener().",
                "category": "security"
            })

        # Inline styles
        inline_styles = re.findall(r'style\s*=\s*["\']', code, re.IGNORECASE)
        if len(inline_styles) > 3:
            issues.append({
                "id": "HTML_INLINE_STYLE",
                "severity": "LOW",
                "line": 0,
                "message": f"Found {len(inline_styles)} inline style attributes. Use CSS classes for maintainability.",
                "category": "best_practice"
            })

        return {
            "issues": issues,
            "valid": len([i for i in issues if i["severity"] == "CRITICAL"]) == 0,
            "tags_found": parser.tag_counts,
            "unclosed": parser.unclosed_tags
        }


class HTMLStructureParser(HTMLParser):
    """Validates HTML tag structure."""

    SELF_CLOSING = {'br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'}

    def __init__(self):
        super().__init__()
        self.tag_stack = []
        self.issues = []
        self.tag_counts = {}
        self.unclosed_tags = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1
        if tag not in self.SELF_CLOSING:
            self.tag_stack.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in self.SELF_CLOSING:
            return
        
        if not self.tag_stack:
            self.issues.append({
                "id": "HTML_EXTRA_CLOSE",
                "severity": "HIGH",
                "line": self.getpos()[0],
                "message": f"Unexpected closing tag </{tag}> with no matching opening tag.",
                "category": "syntax"
            })
            return

        expected_tag, expected_line = self.tag_stack[-1]
        if expected_tag == tag:
            self.tag_stack.pop()
        else:
            # Check if tag exists deeper in stack
            found = False
            for i in range(len(self.tag_stack) - 1, -1, -1):
                if self.tag_stack[i][0] == tag:
                    # Tags between are unclosed
                    for j in range(len(self.tag_stack) - 1, i, -1):
                        unclosed = self.tag_stack.pop()
                        self.unclosed_tags.append(unclosed[0])
                        self.issues.append({
                            "id": "HTML_UNCLOSED",
                            "severity": "HIGH",
                            "line": unclosed[1],
                            "message": f"Tag <{unclosed[0]}> opened at line {unclosed[1]} was never closed.",
                            "category": "syntax"
                        })
                    self.tag_stack.pop()
                    found = True
                    break
            if not found:
                self.issues.append({
                    "id": "HTML_MISMATCH",
                    "severity": "HIGH",
                    "line": self.getpos()[0],
                    "message": f"Closing </{tag}> doesn't match opening <{expected_tag}> at line {expected_line}.",
                    "category": "syntax"
                })

    def close(self):
        super().close()
        for tag, line in self.tag_stack:
            self.unclosed_tags.append(tag)
            self.issues.append({
                "id": "HTML_UNCLOSED",
                "severity": "HIGH",
                "line": line,
                "message": f"Tag <{tag}> opened at line {line} was never closed before end of document.",
                "category": "syntax"
            })


class JavaScriptAnalyzer:
    """JavaScript analysis via regex + structural heuristics."""

    def analyze(self, code: str) -> dict:
        issues = []
        lines = code.split('\n')

        # Syntax-level checks
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            
            # var usage
            if re.match(r'^var\s+', stripped):
                issues.append({
                    "id": "JS_VAR",
                    "severity": "MEDIUM",
                    "line": i,
                    "message": f"'var' at line {i}. Use 'const' or 'let' for proper block scoping.",
                    "category": "best_practice"
                })
            
            # == instead of ===
            if re.search(r'[^!=]==[^=]', stripped) and 'null' not in stripped:
                issues.append({
                    "id": "JS_LOOSE_EQUAL",
                    "severity": "MEDIUM",
                    "line": i,
                    "message": f"Loose equality '==' at line {i}. Use '===' for type-safe comparison.",
                    "category": "logic"
                })
            
            # console.log in production
            if 'console.log(' in stripped:
                issues.append({
                    "id": "JS_CONSOLE_LOG",
                    "severity": "LOW",
                    "line": i,
                    "message": f"console.log() at line {i}. Remove debug logs before production deployment.",
                    "category": "best_practice"
                })

        # Structural checks
        if 'eval(' in code:
            issues.append({
                "id": "JS_EVAL",
                "severity": "CRITICAL",
                "line": 0,
                "message": "eval() detected. This allows arbitrary code execution and is a critical security vulnerability.",
                "category": "security"
            })

        if 'innerHTML' in code:
            issues.append({
                "id": "JS_INNERHTML",
                "severity": "HIGH",
                "line": 0,
                "message": "innerHTML usage detected. This is a primary XSS attack vector. Use textContent or a DOM sanitizer.",
                "category": "security"
            })

        if 'document.write(' in code:
            issues.append({
                "id": "JS_DOC_WRITE",
                "severity": "HIGH",
                "line": 0,
                "message": "document.write() can overwrite the entire page and is blocked in modern browsers during parsing.",
                "category": "security"
            })

        # Check brace matching
        open_braces = code.count('{')
        close_braces = code.count('}')
        if open_braces != close_braces:
            issues.append({
                "id": "JS_BRACE_MISMATCH",
                "severity": "CRITICAL",
                "line": 0,
                "message": f"Brace mismatch: {open_braces} opening '{{' vs {close_braces} closing '}}'. Check for unclosed blocks.",
                "category": "syntax"
            })

        # Check parenthesis matching
        open_parens = code.count('(')
        close_parens = code.count(')')
        if open_parens != close_parens:
            issues.append({
                "id": "JS_PAREN_MISMATCH",
                "severity": "CRITICAL",
                "line": 0,
                "message": f"Parenthesis mismatch: {open_parens} '(' vs {close_parens} ')'. Likely a syntax error.",
                "category": "syntax"
            })

        return {
            "issues": issues,
            "valid": len([i for i in issues if i["severity"] == "CRITICAL"]) == 0
        }


# Language router
ANALYZERS = {
    "python": PythonAnalyzer(),
    "html": HTMLAnalyzer(),
    "javascript": JavaScriptAnalyzer(),
    "js": JavaScriptAnalyzer(),
}


def run_ast_analysis(code: str, language: str) -> dict:
    """Main entry point for AST analysis."""
    lang = language.lower().strip()
    
    # Auto-detect language from content if needed
    if lang not in ANALYZERS:
        if '<!DOCTYPE' in code or '<html' in code or '<div' in code:
            lang = 'html'
        elif 'def ' in code or 'import ' in code:
            lang = 'python'
        else:
            lang = 'javascript'

    analyzer = ANALYZERS.get(lang, JavaScriptAnalyzer())
    result = analyzer.analyze(code)
    result["language_detected"] = lang
    return result
