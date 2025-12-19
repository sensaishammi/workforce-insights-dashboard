# Workforce Insights Dashboard

Production-ready workforce insights dashboard built with Next.js and TypeScript that parses Excel attendance files, computes expected vs actual working hours, enforces monthly leave policies, and visualizes productivity metrics in a responsive dashboard.

## Features

- 📊 **Excel File Upload**: Upload and process Excel attendance files (.xlsx, .xls)
- 👥 **Employee Management**: Track multiple employees and their attendance records
- 📅 **Monthly Analytics**: View monthly summaries with expected vs actual working hours
- 🎯 **Productivity Metrics**: Calculate and visualize productivity percentages
- 📈 **Leave Tracking**: Automatically track leave usage and enforce monthly leave policies
- 🎨 **Responsive Dashboard**: Modern, responsive UI built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16.1.0
- **Language**: TypeScript
- **Database**: MongoDB with Prisma ORM
- **Styling**: Tailwind CSS
- **File Processing**: ExcelJS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sensaishammi/workforce-insights-dashboard.git
cd workforce-insights-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="your_mongodb_connection_string"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Uploading Attendance Data

1. Navigate to the "Upload Data" page
2. Select an Excel file (.xlsx or .xls) with the following format:
   - Column 1: Employee Name/ID
   - Column 2: Date
   - Column 3: In-Time
   - Column 4: Out-Time
3. Click "Upload & Process"
4. The system will process the file and save the data to the database

### Viewing Dashboard

1. Navigate to the Dashboard
2. Select an employee from the dropdown
3. Select a month and year
4. View the monthly summary including:
   - Expected hours
   - Actual worked hours
   - Leaves used
   - Productivity percentage
   - Daily attendance records

## Project Structure

```
workforce-insights-dashboard/
├── actions/              # Server actions for data processing
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── upload/         # Upload page
│   └── page.tsx        # Dashboard page
├── components/          # React components
├── db/                  # Database configuration
├── lib/                 # Utility functions
├── prisma/              # Prisma schema and migrations
├── public/              # Static assets
└── scripts/             # Utility scripts
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate:sample` - Generate sample Excel file
- `npm run fix:employee-ids` - Fix employeeId conflicts in database

## Database Schema

The application uses MongoDB with the following collections:
- **employees**: Employee information
- **attendance_records**: Daily attendance records
- **processed_data**: Monthly processed summaries

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Make sure to set your `DATABASE_URL` environment variable in your deployment platform.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is open source and available under the MIT License.
