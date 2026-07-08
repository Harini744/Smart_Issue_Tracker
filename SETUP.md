# Setup Guide: MongoDB Atlas + Cloudinary + Running Servers

## 1. MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free cluster.
2. **Database Access** → Add user with password (save the password).
3. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for development, or your current IP for production.
4. **Database** → Connect → Drivers → copy the connection string.

Example:

```
mongodb+srv://myuser:<password>@cluster0.xxxxx.mongodb.net/smart-issue-tracker?retryWrites=true&w=majority
```

Replace `<password>` with your real password (URL-encode special characters like `@` → `%40`).

5. Edit `backend/.env`:

```env
MONGO_URI=mongodb+srv://myuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-issue-tracker?retryWrites=true&w=majority
```

6. Seed demo users:

```powershell
cd backend
npm run seed
```

---

## 2. Cloudinary (production image storage)

1. Sign up at [https://cloudinary.com](https://cloudinary.com) (free tier).
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret**.
3. Add to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret
```

4. Restart the backend. Console should show: `Cloudinary configured for image uploads`.

Images upload to folder `smart-issue-tracker/complaints` and URLs are stored in MongoDB (full HTTPS URLs).

**Without Cloudinary:** images save to `backend/uploads/` (local dev).

---

## 3. Start all servers

### Terminal 1 — Backend

```powershell
cd smart-issue-tracker\backend
npm run dev
```

### Terminal 2 — Frontend

```powershell
cd smart-issue-tracker\frontend
npm start
```

### Terminal 3 — AI service (optional)

```powershell
cd smart-issue-tracker\ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

| Service   | URL                      |
|-----------|--------------------------|
| Frontend  | http://localhost:3000    |
| Backend   | http://localhost:5000/api |
| AI Vision | http://localhost:8000    |

### Demo login

- Admin: `admin@college.edu` / `admin123`
- Student: `student@college.edu` / `student123`

---

## 4. Full `backend/.env` example

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-issue-tracker?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```
