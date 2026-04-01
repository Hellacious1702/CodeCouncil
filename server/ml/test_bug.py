from ast_engine import run_ast_analysis
from codebert_engine import predict_vulnerability

print("--- Testing CodeBERT ---")
try:
    print(predict_vulnerability("var x = 10;", "javascript"))
except Exception as e:
    import traceback
    traceback.print_exc()

print("\n--- Testing AST Engine JS ---")
try:
    print(run_ast_analysis("var x = 10; eval('console.log(x)');", "javascript"))
except Exception as e:
    import traceback
    traceback.print_exc()
