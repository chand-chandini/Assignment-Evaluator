# ThinkPlus

AI-powered assignment evaluation platform for instructors and students.

## Features

- **Students**: Submit assignments, view feedback, check plagiarism risk
- **Instructors**: Create assignments, review submissions, view AI-generated reports
- **AI Evaluation**: Plagiarism detection, content analysis, automated feedback

## Tech Stack

- **Backend**: Node.js, Express, MySQL
- **Frontend**: HTML, CSS, JavaScript
- **AI**: Content analysis and plagiarism detection

## Quick Start

### 1. Setup Database
```bash
mysql -u root < backend/database/schema.sql
```

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3. Run Server
```bash
npm start
```

Open `frontend/index.html` in your browser.

## License

MIT
   DB_NAME=assignment_platform
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

4. Start the server:

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### 3. Frontend Setup

The frontend is static HTML with vanilla JavaScript. No build process needed.

1. Open the folder in a simple HTTP server or use VS Code Live Server
2. Navigate to `http://localhost:5000` (or your local server)

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/user/:id` - Get user details (protected)

### Assignments

- `GET /api/assignments/` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `GET /api/assignments/instructor/:instructor_id` - Get instructor's assignments
- `POST /api/assignments/` - Create assignment (instructor only)
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submissions

- `POST /api/submissions/submit` - Submit assignment
- `GET /api/submissions/:id` - Get submission details
- `GET /api/submissions/student/:student_id` - Get student's submissions
- `GET /api/submissions/assignment/:assignment_id` - Get all submissions for assignment
- `GET /api/submissions/feedback/:submission_id` - Get feedback

## Test Credentials

### Students

- Email: `john@example.com` | Password: `password123`
- Email: `jane@example.com` | Password: `password123`

### Instructor

- Email: `wilson@example.com` | Password: `password123`

## Database Schema

### Users Table

- id: INT (Primary Key)
- username: VARCHAR(50) UNIQUE
- email: VARCHAR(100) UNIQUE
- password: VARCHAR(255)
- role: ENUM('student', 'instructor')
- created_at: TIMESTAMP

### Assignments Table

- id: INT (Primary Key)
- title: VARCHAR(200)
- description: TEXT
- instructor_id: INT (Foreign Key)
- max_score: INT (Default: 100)
- due_date: DATETIME
- created_at: TIMESTAMP

### Submissions Table

- id: INT (Primary Key)
- assignment_id: INT (Foreign Key)
- student_id: INT (Foreign Key)
- submission_text: TEXT
- file_path: VARCHAR(255)
- submitted_at: TIMESTAMP
- status: ENUM('pending', 'evaluated')

### Feedback Table

- id: INT (Primary Key)
- submission_id: INT (Foreign Key UNIQUE)
- plagiarism_risk: DECIMAL(5,2)
- feedback_summary: TEXT
- score: INT
- evaluated_at: TIMESTAMP

## Key Technologies

**Backend:**

- Express.js - Web framework
- MySQL2 - Database driver
- JWT - Authentication
- Bcryptjs - Password hashing
- Multer - File uploads
- Natural - NLP for plagiarism detection

**Frontend:**

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3 with Grid/Flexbox

## Development Notes

1. **Authentication**: The system uses JWT tokens for protected routes
2. **File Uploads**: Files are stored in the `backend/uploads/` directory
3. **AI Evaluation**: Uses TF-IDF for plagiarism similarity calculation
4. **CORS**: Enabled for local development (update for production)

## Troubleshooting

### Port Already in Use

If port 5000 is already in use:

```bash
# Linux/Mac: Find the process
lsof -i :5000

# Change port in .env or server.js
```

### Database Connection Error

- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists: `USE assignment_platform;`

### CORS Error

- Make sure backend is running on correct port
- Update API_BASE_URL in frontend/js/script.js if needed

### File Upload Issues

- Ensure `backend/uploads/` directory exists
- Check file size limits (10MB default)
- Verify allowed file types

## Production Checklist

- [ ] Change JWT_SECRET to a strong value
- [ ] Hash passwords with bcrypt
- [ ] Set DATABASE security credentials
- [ ] Update CORS allowed origins
- [ ] Enable HTTPS
- [ ] Use environment-specific configs
- [ ] Implement rate limiting
- [ ] Add logging system

---

## 🚀 DEPLOYMENT GUIDE

### Deploy Frontend to Vercel (Recommended)

#### Prerequisites

- GitHub account
- Vercel account (free tier available)
- Code pushed to GitHub

#### Step-by-Step Deployment

**1. Push Code to GitHub**

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: ThinkPlus application"

# Create main branch
git branch -M main

# Add remote repository
git remote add origin https://github.com/yourusername/thinkplus.git

# Push to GitHub
git push -u origin main
```

**2. Deploy to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose GitHub
3. Authorize GitHub integration
4. Click "New Project"
5. Select `thinkplus` repository
6. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Environment Variables**: Click "Add"
     - Add `REACT_APP_API_URL=https://your-backend-url.com`
7. Click "Deploy"

**Vercel Frontend URL**: `https://thinkplus.vercel.app`

### Deploy Backend to Railway

#### Prerequisites

- GitHub account with code pushed
- Railway account ([railway.app](https://railway.app))
- MySQL database (use Railway's MySQL service)

#### Step-by-Step Deployment

**1. Create Railway Account**

- Go to [railway.app](https://railway.app)
- Click "Sign Up"
- Connect with GitHub

**2. Setup Database**

1. Create new project
2. Click "+ Add Service"
3. Select "MySQL"
4. Configure:
   - Database Name: `assignment_platform`
   - Root Password: Generate strong password
5. Note the connection details

**3. Deploy Backend**

1. Click "+ Add Service"
2. Select "GitHub Repo"
3. Choose `thinkplus` repository
4. Configure:
   - **Service Name**: thinkplus-backend
   - **Root Directory**: `backend`
   - **Preinstall Command**: Leave empty
   - **Build Command**: Leave empty
   - **Start Command**: `node server.js`

**4. Set Environment Variables**
In Railway project settings, add variables:

```
PORT=3000
DB_HOST=[Railway MySQL Host]
DB_PORT=3306
DB_USER=root
DB_PASSWORD=[Generated Password]
DB_NAME=assignment_platform
JWT_SECRET=[Generate random secret]
NODE_ENV=production
CORS_ORIGIN=https://thinkplus.vercel.app
```

**5. Deploy Database Schema**

```bash
# Connect to Railway MySQL
mysql -h [host] -u root -p[password] < backend/database/schema.sql
```

**Railway Backend URL**: `https://your-backend-railway.app`

### Update Frontend Configuration

After deployment, update frontend API URL:

Edit `frontend/js/script.js`:

```javascript
// Find this line:
const API_BASE = "http://localhost:5000/api";

// Replace with:
const API_BASE = "https://your-backend-railway.app/api";
```

Redeploy on Vercel to apply changes.

### Environment Variables Summary

**Backend Production (.env)**

```
PORT=3000
NODE_ENV=production
DB_HOST=your-railway-host.railway.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=strong_password_here
DB_NAME=assignment_platform
JWT_SECRET=super_secret_key_generate_this
CORS_ORIGIN=https://thinkplus.vercel.app
```

**Frontend Production**

```
REACT_APP_API_URL=https://your-backend-railway.app
```

## 📊 Database ER Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ *id (PK)        │
│  username       │
│  email          │
│  password       │
│  role           │
│  created_at     │
└────────┬────────┘
         │
         ├──────────────────────┬──────────────────────┐
         │                      │                      │
         │ (Instructor)         │ (Student)            │
         │                      │                      │
    ┌─────────────────┐     ┌──────────────────┐
    │  Assignments    │     │  Submissions     │
    ├─────────────────┤     ├──────────────────┤
    │ *id (PK)        │     │ *id (PK)         │
    │  title          │     │ #assignment_id   │
    │  description    │     │ #student_id      │
    │ #instructor_id  │◄────│  submission_text │
    │  max_score      │     │  file_path       │
    │  due_date       │     │  status          │
    │  created_at     │     │  submitted_at    │
    └────────┬────────┘     └────────┬─────────┘
             │                       │
             │                       │ (1:1)
             │                       │
             │                  ┌────────────────┐
             │                  │   Feedback     │
             │                  ├────────────────┤
             │                  │ *id (PK)       │
             │                  │ #submission_id │
             │                  │  plagiarism    │
             │                  │  feedback      │
             │                  │  score         │
             │                  │  created_at    │
             │                  └────────────────┘
             │
             └─ (1:Many) relationship
```

**Relationships:**

- Users (1) → Many Assignments
- Users (1) → Many Submissions
- Assignments (1) → Many Submissions
- Submissions (1) → One Feedback

## 🔐 Security Considerations

1. Passwords: Hashed using bcryptjs (done automatically)
2. JWT Tokens: Stored in localStorage, validate on every request
3. SQL Injection: Uses prepared statements
4. CORS: Configured for specific origins
5. File Upload: Validates file types and size
6. Rate Limiting: Recommended for production
7. HTTPS: Required for deployment

## 📈 Performance Optimization

- Indexed database queries
- Connection pooling for MySQL
- Cached static assets
- Gzip compression
- Lazy loading for large submissions
- Database query optimization

## 🔄 Continuous Integration/Deployment

Consider adding GitHub Actions for:

```yaml
# GitHub Actions example
- Run tests on push
- Auto-deploy to Vercel on merge to main
- Database migrations on deployment
```

## 📞 Support & Documentation

- **Issues**: Report on GitHub Issues
- **Documentation**: See OFFLINE_MODE.md for offline usage
- **Database**: See DATABASE_SCHEMA.md for detailed schema

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated**: February 19, 2026
**Version**: 1.0.0
**Status**: Production Ready

- [ ] Regular database backups

## Future Enhancements

- Email notifications for submissions
- Advanced plagiarism detection with external APIs
- Student group assignments
- Assignment versioning
- Admin dashboard
- Real-time notifications
- Mobile app
- Export reports

## Support & Questions

For issues or suggestions, please check the codebase or contact the development team.

## License

This project is subject to your organization's license agreement.
