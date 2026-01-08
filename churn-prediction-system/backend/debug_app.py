import uvicorn
import traceback

try:
    from app import app
    uvicorn.run(app, host="127.0.0.1", port=8000)
except Exception:
    print(traceback.format_exc())
