# rag-api

REST API for question answering over PDFs (RAG). You upload a PDF and ask questions about it. Answers are based only on the document's content, list their sources, and can be streamed over Server-Sent Events (SSE).

## How it works

```
Upload:  PDF → pdf-parse (one document per page) → chunks (1000 chars, 200 overlap)
         → OpenAI embeddings (text-embedding-3-small) → Qdrant

Ask:     question → embedding → top-K chunks from Qdrant
         → gpt-4o-mini with the chunks as context → answer + sources
```

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 26 LTS, TypeScript, tsx |
| HTTP | Express 5, multer, zod 4 |
| RAG | LangChain (`@langchain/core`, `@langchain/openai`, `@langchain/textsplitters`), pdf-parse 2 |
| Models | OpenAI `text-embedding-3-small`, `gpt-4o-mini` |
| Vector store | Qdrant 1.20 (Docker) |

## Prerequisites

- Node.js 26 (`nvm use` reads `.nvmrc`) and npm 11+
- Docker
- An OpenAI API key

## Getting started

```bash
cp .env.sample .env
# set OPENAI_API_KEY, and QDRANT_API_KEY, e.g. with: openssl rand -hex 32

docker compose up -d   # Qdrant on 127.0.0.1:6333
npm install
npm run dev            # API on http://localhost:3000
```

Check that it is running with `curl localhost:3000/health`, which returns `OK`.

## Configuration

Variables are read from `.env`.

| Variable | Required | Default |
|---|---|---|
| `OPENAI_API_KEY` | yes | — |
| `QDRANT_API_KEY` | yes | — |
| `QDRANT_URL` | no | `http://localhost:6333` |
| `QDRANT_COLLECTION_NAME` | no | `documents` |
| `SERVER_PORT` | no | `3000` |
| `UPLOADS_DIRECTORY` | no | `./uploads` |

`docker compose` reads the same `QDRANT_API_KEY` and refuses to start without it.

## API

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/health` | — | `OK` |
| `POST` | `/documents/upload` | multipart field `file` (PDF, max 10 MB) | `documentId`, `chunksCount` |
| `POST` | `/query` | `{ "question", "topK"? }` | matching chunks with `score` and `page` |
| `POST` | `/rag` | `{ "question", "topK"? }` | `answer` and `sources` |
| `POST` | `/rag/stream` | `{ "question", "topK"? }` | SSE events: `sources`, then `token`s, then `done` |

- `question`: a string of 1 to 500 characters (surrounding whitespace is trimmed).
- `topK`: an integer from 1 to 10. The default is 3.
- Invalid input returns `400` with field-level `details`.

```bash
# Upload a document
curl -F "file=@sample/NIKE10K2023.pdf;type=application/pdf" localhost:3000/documents/upload

# Ask a question
curl -H "Content-Type: application/json" \
  -d '{"question":"What was Nike total revenue in fiscal 2023?"}' \
  localhost:3000/rag
```

## Sample chat

With the API running, open `sample/chat.html` in a browser for a minimal streaming chat. `sample/NIKE10K2023.pdf` is a document you can upload to try it.

## Project structure

```
src/
  routes/       HTTP endpoints
  services/     PDF loading, embeddings, Qdrant and the RAG chain
  middleware/   upload, validation and error handling
  schemas/      zod request schemas
  config.ts     environment configuration
  index.ts      server entry point
```

## Security notes

- Qdrant requires an API key and is published only on `127.0.0.1`.
- The API itself has no authentication, and CORS allows any origin. Do not expose it publicly as is.

## Limitations

- PDF only.
- Answers are always in Brazilian Portuguese.
- No production build yet: the only script is `npm run dev`.
- No automated tests.
