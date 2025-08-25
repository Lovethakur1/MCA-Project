@echo off
echo Installing MCA CMS...
echo.

echo Installing Node.js dependencies...
npm install

echo.
echo Creating admin user...
node scripts/create-admin.js

echo.
echo Setup complete!
echo.
echo To start the development server, run:
echo npm run dev
echo.
echo Then visit http://localhost:3000 to see your website
echo Visit http://localhost:3000/admin to access the admin panel
echo.
echo Default admin credentials:
echo Email: admin@example.com
echo Password: admin123
echo.
echo Make sure MongoDB is running before starting the server!
echo.
pause
