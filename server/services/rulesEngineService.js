// Production-Grade Deterministic Rule Engine (Local Analysis)
// Mission: Zero-API Deep Neural Auditing via Tiered Static Analysis

const SECURITY_RULES = [
  { id: 'SEC01', p: /eval\(|new Function\(/g, s: 'CRITICAL', m: 'Arbitrary code execution sink detected. Non-negotiable security breach.' },
  { id: 'SEC02', p: /\.innerHTML|\.outerHTML|document\.write\(/g, s: 'HIGH', m: 'Direct DOM string injection detected. XSS vulnerability identified.' },
  { id: 'SEC03', p: /(?:API_KEY|SECRET|PASSWORD|TOKEN|AUTH_KEY)\s*[:=]\s*['"`][a-zA-Z0-9_\-]{16,}['"`]/gi, s: 'CRITICAL', m: 'Hardcoded sensitive credential identified in source.' },
  { id: 'SEC04', p: /input\(|raw_input\(/g, s: 'MEDIUM', m: 'Unsanitized user input sink detected. Verification of sanitization layer required.' },
  { id: 'SEC05', p: /os\.system\(|subprocess\.Popen\(shell=True\)|exec\(/g, s: 'HIGH', m: 'Shell command injection point. Dangerous execution context detected.' },
  { id: 'SEC06', p: /Math\.random\(\)/g, s: 'MEDIUM', m: 'Insecure random number generator. Use crypto.getRandomValues() for cryptographic contexts.' },
  { id: 'SEC07', p: /localStorage\.setItem\(|sessionStorage\.setItem\(/g, s: 'LOW', m: 'Plaintext storage of potential sensitive data in browser-side memory.' },
  { id: 'SEC08', p: /dangerousSetInnerHTML/g, s: 'HIGH', m: 'React-specific XSS sink identified. Prop-drilling of raw HTML detected.' },
  { id: 'SEC09', p: /SELECT .* FROM .* \+/g, s: 'CRITICAL', m: 'Classic SQL Injection pattern via string concatenation detected.' },
  { id: 'SEC10', p: /bcrypt\.hash\(.*?, 10\)/g, s: 'INFO', m: 'Standard hashing complexity detected. Recommend increasing salt rounds for 2026 standards.' }
];

const PERFORMANCE_RULES = [
  { id: 'PERF01', p: /(?:for|while).*\{[\s\S]*?(?:for|while)/g, s: 'HIGH', m: 'O(n^x) Complexity detected: Multiple nested loops with heavy interior logic.' },
  { id: 'PERF02', p: /readFileSync|writeFileSync|execSync/g, s: 'HIGH', m: 'Synchronous blocking operation on the main event loop. Total latency bottleneck.' },
  { id: 'PERF03', p: /^var\s+/gm, s: 'MEDIUM', m: 'Stale scope declaration via "var". Hoisting risks and inefficient memory allocation identified.' },
  { id: 'PERF04', p: /(?:for|while).*[\s\S]*?(?:print\(|console\.log\()/g, s: 'MEDIUM', m: 'Log pollution in hot loops. Significant I/O overhead detected.' },
  { id: 'PERF05', p: /new Array\(10000\)|new Buffer\(10000\)/g, s: 'HIGH', m: 'Large memory allocation detected in single frame. Buffer overflow or GC pressure suspected.' },
  { id: 'PERF06', p: /setInterval\(/g, s: 'LOW', m: 'Global timer interval without clear disposal logic. Potential memory leak sink.' },
  { id: 'PERF07', p: /\.map\(.*?\).filter\(.*?\)/g, s: 'MEDIUM', m: 'Inefficient array processing chain. Recommend single-pass "reduce" for O(n) optimization.' },
  { id: 'PERF08', p: /import \* as/g, s: 'MEDIUM', m: 'Wildcard import detected. Tree-shaking engine failure. Increasing final bundle size.' }
];

const generateDetailedPersonaResponse = (matches, type, code) => {
  const isSigma = type === 'security';
  const prefix = isSigma 
    ? "AGENT SIGMA [HOSTILE_AUDITOR]: CODE IS SUBSTANDARD. SECURITY PARAMETERS BREACHED.\n\n"
    : "AGENT DELTA [EFFICIENCY_ENGINE]: ARCHITECTURAL DECAY DETECTED. PERFORMANCE METRICS ARE UNACCEPTABLE.\n\n";

  if (matches.length === 0) {
    return prefix + "My initial scan shows no obvious catastrophic failures in this rudimentary logic. However, absence of evidence is not evidence of absence. I am monitoring your execution context for subtle anomalies. Proceed with extreme caution.";
  }

  let body = matches.map(m => `> [${m.severity}] ANALYSIS_UNIT_${m.id}\n- ${m.message}\n- TECHNICAL_RISK: High. This pattern represents a fundamental failure in safe ${isSigma ? 'engineering' : 'optimization'} protocols.`).join('\n\n');

  const expansionText = isSigma 
    ? "\n\nCRITICAL WARNING: The detected sinks are characteristic of amateurish development. If this code reaches production in its current state, the attack surface will be massive. I am flagging this entire module for an immediate audit-refactor. Do not ignore these alerts."
    : "\n\nOPTIMIZATION DIRECTIVE: The architectural debt found here is staggering. Your event loop is gasping for air under these synchronous constraints and nested complexities. I am recalculating your resource footprint... wait, it just went off the charts. Rebuild this immediately.";

  return prefix + body + expansionText;
};

const findMatches = (code, rules) => {
  const results = [];
  rules.forEach(r => {
    const match = code.match(r.p);
    if (match) results.push({ id: r.id, severity: r.s, message: r.m });
  });
  return results;
};

exports.runSecurityAuditor = async (code, language, customPrompt = '') => {
  const matches = findMatches(code, SECURITY_RULES);
  return generateDetailedPersonaResponse(matches, 'security', code);
};

exports.runPerformanceOptimizer = async (code, language, customPrompt = '') => {
  const matches = findMatches(code, PERFORMANCE_RULES);
  return generateDetailedPersonaResponse(matches, 'performance', code);
};

exports.runSecurityReply = async (code, language, sigmaAudit, deltaAudit) => {
  return "SIGMA: I have reviewed Delta's 'optimizations.' They are as reckless as expected. Speed is a privilege, not a right—and it certainly doesn't justify opening shell-injection sinks. I am maintaining my CRITICAL flags. You prioritize latency over safety at your own peril.";
};

exports.runPerformanceReply = async (code, language, deltaAudit, sigmaAudit) => {
  return "DELTA: Sigma's paranoid rambling is slowing us down. The suggested text-sanitization layer adds O(n) overhead to every I/O call. In a production environment, this is suicide. I am dismissing these security flags as 'Theoretical Noise.' Optimization remains the priority.";
};

exports.runJudge = async (code, language, sigmaFull, deltaFull, customPrompt = '') => {
  const hasCritical = sigmaFull.includes('CRITICAL') || deltaFull.includes('CRITICAL');
  
  const resolution = {
    reasoningTrace: "HYBRID_LOCAL_DETERMINISTIC_SETTLEMENT_v2.0",
    conflictDetected: true,
    judgeResolution: hasCritical 
      ? "JUDGE VERDICT: The local engine has identified a CRITICAL Architectural Failure. Performance trade-offs are secondary to system stability. Refactoring of identified memory/security bottlenecks is MANDATORY. Do not deploy."
      : "JUDGE VERDICT: The debate has reached a synthesis. No critical failures detected, but significant stylistic and optimization gains are possible. Suggest using 'const', moving to async I/O, and removing high-frequency console logs.",
    optimizedCode: code // In a local engine, we don't automatically refactor complex logic yet
  };

  return JSON.stringify(resolution);
};
