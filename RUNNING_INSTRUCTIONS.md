# How to Run the Project

## ✅ Quick Start

The development server is now starting! Here's what you need to know:

### 1. **Access the Application**
Once the server starts, open your browser and go to:
```
http://localhost:3000
```

### 2. **What You'll See**
- **Dashboard Page** (`/`): Main dashboard with employee analytics
- **Upload Page** (`/upload`): Upload Excel attendance files

### 3. **Prerequisites Check** ✅
- ✅ Dependencies installed
- ✅ Prisma Client generated
- ✅ Environment variables configured (.env.local exists)
- ✅ Development server starting

## 🚀 Server Commands

### Start Development Server:
```bash
npm run dev
```
Server runs on: **http://localhost:3000**

### Build for Production:
```bash
npm run build
```

### Start Production Server:
```bash
npm start
```

### Other Useful Commands:
```bash
# Generate sample Excel file for testing
npm run generate:sample

# Fix employee ID conflicts in database
npm run fix:employee-ids

# Run linter
npm run lint
```

## 📋 First Time Setup (If Needed)

### 1. Install Dependencies:
```bash
npm install
```

### 2. Set Up Environment Variables:
Create `.env.local` file in the root directory:
```env
DATABASE_URL="your_mongodb_connection_string"
```

### 3. Generate Prisma Client:
```bash
npx prisma generate
```

### 4. Push Database Schema:
```bash
npx prisma db push
```

## 🧪 Testing the Application

### 1. **Test Dashboard**
- Go to http://localhost:3000
- You should see the dashboard (may be empty if no data)

### 2. **Test Upload**
- Click "Upload Data" or go to http://localhost:3000/upload
- Upload a sample Excel file
- Format: Employee Name | Date | In-Time | Out-Time

### 3. **Generate Sample Excel**
If you need a sample file:
```bash
npm run generate:sample
```
This creates a sample Excel file you can use for testing.

## 🔧 Troubleshooting

### Server Won't Start?
1. Check if port 3000 is already in use
2. Make sure `.env.local` exists with `DATABASE_URL`
3. Run `npm install` to ensure dependencies are installed
4. Run `npx prisma generate` to generate Prisma client

### Database Connection Issues?
1. Verify `DATABASE_URL` in `.env.local` is correct
2. Ensure MongoDB is running (if local) or accessible (if cloud)
3. Run `npx prisma db push` to sync schema

### Build Errors?
1. Run `npm run build` to see detailed error messages
2. Check TypeScript errors: `npx tsc --noEmit`
3. Ensure all dependencies are installed

## 📝 Notes

- The server runs in development mode with hot reload
- Changes to files will automatically refresh the browser
- Check the terminal for any error messages
- Server logs will show compilation status and errors

## 🎯 Next Steps

1. **Open Browser**: Navigate to http://localhost:3000
2. **Upload Data**: Try uploading an Excel file
3. **View Dashboard**: Check the analytics and reports
4. **Test Features**: Verify all functionalities work

---

**Server Status**: The development server should be running now!
Check your terminal for the "Ready" message and any compilation status.

