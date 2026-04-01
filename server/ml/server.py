"""
CodeCouncil ML Microservice — FastAPI Server
Combines Tier 1 (AST) + Tier 2 (CodeBERT) into a unified analysis endpoint.
Runs on port 8000 alongside the Node.js backend (port 5050).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time

from ast_engine import run_ast_analysis
from codebert_engine import predict_vulnerability, get_model_status


app = FastAPI(
    title="CodeCouncil ML Engine",
    description="Hybrid AST + CodeBERT code analysis microservice",
    version="1.0.0"
)

# Allow the Node.js backend to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    code: str
    language: str = "python"


class AnalyzeResponse(BaseModel):
    success: bool
    ast_analysis: dict
    ml_analysis: dict
    combined_report: dict
    latency_ms: float


def _synthesize_persona_report(ast_result: dict, ml_result: dict, language: str) -> dict:
    """
    Combine AST and ML results into persona-driven agent reports.
    This is where we generate the SIGMA, DELTA, and JUDGE outputs.
    """
    issues = ast_result.get("issues", [])
    
    # Categorize issues
    security_issues = [i for i in issues if i["category"] in ("security", "syntax")]
    perf_issues = [i for i in issues if i["category"] in ("performance", "maintainability", "logic")]
    other_issues = [i for i in issues if i["category"] not in ("security", "syntax", "performance", "maintainability", "logic")]
    
    # Add ML issues to security
    ml_available = ml_result.get("available", False)
    ml_risk = ml_result.get("risk_level", "UNKNOWN")
    ml_confidence = ml_result.get("confidence", 0)
    
    # === SIGMA REPORT ===
    sigma_lines = ["AGENT SIGMA [HOSTILE_AUDITOR] — STRUCTURAL + NEURAL ANALYSIS COMPLETE.", ""]
    
    if ml_available and ml_result.get("is_vulnerable"):
        sigma_lines.append(f"⚠ CODEBERT NEURAL SCAN: {ml_risk} RISK ({ml_confidence}% confidence)")
        sigma_lines.append(f"  └─ {ml_result.get('risk_description', '')}")
        sigma_lines.append("")
    elif ml_available:
        sigma_lines.append(f"✓ CODEBERT NEURAL SCAN: {ml_risk} ({ml_confidence}% vulnerability probability)")
        sigma_lines.append(f"  └─ {ml_result.get('risk_description', '')}")
        sigma_lines.append("")
    
    if security_issues:
        sigma_lines.append(f"AST STRUCTURAL ANALYSIS: {len(security_issues)} SECURITY/SYNTAX VIOLATION(S) DETECTED.")
        sigma_lines.append("")
        for idx, issue in enumerate(security_issues, 1):
            sigma_lines.append(f"  [{issue['severity']}] {issue['id']}")
            line_info = f" (line {issue['line']})" if issue.get('line') else ""
            sigma_lines.append(f"    ├─ Location:{line_info}")
            sigma_lines.append(f"    ├─ Finding: {issue['message']}")
            sigma_lines.append(f"    └─ Impact: {'IMMEDIATE REMEDIATION REQUIRED' if issue['severity'] in ('CRITICAL', 'HIGH') else 'Review and fix before deployment'}")
            sigma_lines.append("")
    else:
        sigma_lines.append("AST STRUCTURAL ANALYSIS: No critical security violations detected in code structure.")
        sigma_lines.append("  └─ Note: This does not guarantee absence of logical vulnerabilities.")
        sigma_lines.append("")
    
    sigma_lines.append("SIGMA CONCLUSION:")
    total_critical = len([i for i in security_issues if i["severity"] in ("CRITICAL", "HIGH")])
    if total_critical > 0 or (ml_available and ml_result.get("is_vulnerable")):
        sigma_lines.append(f"  This code exhibits {total_critical} critical structural defect(s)")
        if ml_available and ml_result.get("is_vulnerable"):
            sigma_lines.append(f"  AND CodeBERT neural inference confirms vulnerability ({ml_confidence}% confidence).")
        sigma_lines.append("  DEPLOYMENT STATUS: BLOCKED. Immediate refactoring required.")
    else:
        sigma_lines.append("  No critical threats identified by structural or neural analysis.")
        sigma_lines.append("  DEPLOYMENT STATUS: CONDITIONALLY APPROVED pending performance review.")
    
    # === DELTA REPORT ===
    delta_lines = ["AGENT DELTA [EFFICIENCY_ENGINE] — PERFORMANCE TRACE COMPLETE.", ""]
    
    if perf_issues:
        delta_lines.append(f"PERFORMANCE ANALYSIS: {len(perf_issues)} OPTIMIZATION TARGET(S) IDENTIFIED.")
        delta_lines.append("")
        for idx, issue in enumerate(perf_issues, 1):
            delta_lines.append(f"  [{issue['severity']}] {issue['id']}")
            line_info = f" (line {issue['line']})" if issue.get('line') else ""
            delta_lines.append(f"    ├─ Location:{line_info}")
            delta_lines.append(f"    ├─ Bottleneck: {issue['message']}")
            delta_lines.append(f"    └─ Latency Impact: {'Significant overhead detected' if issue['severity'] in ('CRITICAL', 'HIGH') else 'Minor but should be addressed'}")
            delta_lines.append("")
    else:
        delta_lines.append("PERFORMANCE ANALYSIS: No significant performance bottlenecks detected.")
        delta_lines.append("  └─ Code structure appears reasonably efficient.")
        delta_lines.append("")

    if other_issues:
        delta_lines.append(f"ADDITIONAL FINDINGS: {len(other_issues)} item(s)")
        for issue in other_issues:
            delta_lines.append(f"  [{issue['severity']}] {issue['message']}")
        delta_lines.append("")
    
    ast_info = ast_result.get("node_count", "N/A")
    depth = ast_result.get("ast_depth", "N/A")
    delta_lines.append(f"COMPLEXITY METRICS:")
    delta_lines.append(f"  ├─ AST Node Count: {ast_info}")
    delta_lines.append(f"  ├─ AST Tree Depth: {depth}")
    delta_lines.append(f"  └─ Functions: {len(ast_result.get('functions', []))}, Classes: {len(ast_result.get('classes', []))}")
    
    # === JUDGE REPORT ===
    all_issues = issues
    critical_count = len([i for i in all_issues if i["severity"] == "CRITICAL"])
    high_count = len([i for i in all_issues if i["severity"] == "HIGH"])
    
    if critical_count > 0 or (ml_available and ml_confidence > 70):
        verdict = "REJECT"
        resolution = f"Code contains {critical_count} CRITICAL and {high_count} HIGH severity issues. "
        if ml_available and ml_result.get("is_vulnerable"):
            resolution += f"CodeBERT neural scan confirms vulnerability with {ml_confidence}% confidence. "
        resolution += "This code MUST NOT be deployed without addressing all critical findings."
    elif high_count > 0:
        verdict = "CONDITIONAL"
        resolution = f"Code contains {high_count} HIGH severity issues that should be addressed. "
        resolution += "Deployment is conditionally approved if these are remediated."
    else:
        verdict = "APPROVED"
        resolution = "No critical or high-severity issues found by either AST or neural analysis. "
        resolution += "Code is approved for deployment with standard review."
    
    # Build structured judge output
    judge_output = {
        "reasoningTrace": f"Analyzed {len(all_issues)} findings across security, performance, and structural categories. "
                         f"AST depth: {depth}, Nodes: {ast_info}. "
                         f"ML confidence: {ml_confidence}% vulnerability probability.",
        "conflictDetected": critical_count > 0 and len(perf_issues) > 0,
        "judgeResolution": resolution,
        "verdict": verdict,
        "optimizedCode": ""  # Would need a generative model to produce this
    }
    
    return {
        "sigma_output": "\n".join(sigma_lines),
        "delta_output": "\n".join(delta_lines),
        "judge_output": judge_output,
        "total_issues": len(all_issues),
        "critical_count": critical_count,
        "high_count": high_count,
        "ml_risk_level": ml_risk if ml_available else "UNAVAILABLE"
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_code(request: AnalyzeRequest):
    """Main analysis endpoint — combines AST + CodeBERT."""
    start = time.time()
    
    try:
        # Tier 1: AST Analysis
        ast_result = run_ast_analysis(request.code, request.language)
        
        # Tier 2: CodeBERT Neural Inference
        ml_result = predict_vulnerability(request.code, request.language)
        
        # Combine into persona reports
        combined = _synthesize_persona_report(ast_result, ml_result, request.language)
        
        latency = round((time.time() - start) * 1000, 2)
        
        return AnalyzeResponse(
            success=True,
            ast_analysis=ast_result,
            ml_analysis=ml_result,
            combined_report=combined,
            latency_ms=latency
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    """Health check endpoint."""
    model_status = get_model_status()
    return {
        "status": "ok",
        "ast_engine": "ready",
        "ml_engine": "ready" if model_status["loaded"] else ("loading" if model_status["loading"] else "pending"),
        "model_details": model_status
    }


@app.get("/status")
async def status():
    """Detailed status endpoint."""
    return get_model_status()


if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("  CodeCouncil ML Engine v1.0")
    print("  AST Structural Analysis + CodeBERT Neural Inference")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
