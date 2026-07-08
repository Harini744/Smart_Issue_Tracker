"""
FastAPI microservice for CNN-based issue image classification.
Run: uvicorn app:app --host 0.0.0.0 --port 8000
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cnn_model import load_model, predict

app = FastAPI(
    title='Smart Issue Tracker - AI Vision Service',
    description='CNN-based image classification for complaint categorization',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


class AnalyzeRequest(BaseModel):
    imagePath: str = None
    imageUrl: str = None


@app.on_event('startup')
async def startup():
    weights = os.path.join(os.path.dirname(__file__), 'models', 'issue_cnn.pth')
    load_model(weights if os.path.exists(weights) else None)


@app.get('/health')
async def health():
    return {'status': 'OK', 'service': 'ai-vision'}


@app.post('/analyze-image')
async def analyze_image(req: AnalyzeRequest):
    try:
        if req.imagePath:
            path = os.path.normpath(req.imagePath)
            result = predict(path)
            return result
        if req.imageUrl:
            import tempfile
            import urllib.request
            suffix = '.jpg'
            if '.' in req.imageUrl.split('?')[0]:
                ext = req.imageUrl.split('?')[0].rsplit('.', 1)[-1].lower()
                if ext in ('png', 'gif', 'webp', 'jpeg', 'jpg'):
                    suffix = f'.{ext}' if ext != 'jpeg' else '.jpg'
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                urllib.request.urlretrieve(req.imageUrl, tmp.name)
                result = predict(tmp.name)
                os.unlink(tmp.name)
            return result
        raise HTTPException(status_code=400, detail='Provide imagePath or imageUrl')
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='0.0.0.0', port=8000, reload=True)
