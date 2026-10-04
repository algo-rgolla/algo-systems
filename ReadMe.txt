CoPilot:
GetHub login Id


UPCloud
https://upcloud.com/register
rgolla
AlgoHost15%

--------------------------------------------
Push React solution to GitHub from VS2022:
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main

git add .
git commit -m "Initial commit"
git push -u origin main

-------------------------------

https://vercel.com/signup
Vercel Registration:
Login with your GitHub credentials.
GIT username: algo-rgolla


Settingup Task Scheduler:
Ctrl+R > Run taskschd.msc


GitHub:
ravi.golla@hotmail.com
UserId:  algo-rgolla
Pwd: AlgoSource15%

Owner: algo-rgolla
Repository: algo-react-ui

https://eodhd.com/cp/dashboard
Use golla.ravi@gmail.com for login


Home Deploy:
http://localhost:5001/swagger/index.html
http://localhost:5000/login


Windows Service Create and Start: 
--------------------------------
sc create MyWindowsService binPath= "C:\path\to\published\MyWindowsService.exe"
net start MyWindowsService


Technologies:
------------
ASP.NET Core
React
Entity Framework

Packages Installed:
-------------------
1. Swagger
2. Automapper
3. Entity Framework Core




TODO:
----------
1. Repository Pattern
2. 

How to Reseed Table:

DBCC CHECKIDENT ( '[dbo].[EodhdSymbolDetails]', RESEED, 1)

How To:
--------
1. How to generate DB Entities:

-In Visual Studio 2022, select startup project as AlgoSystems.Core.Portal
- Open "Package Manager Console" and run the following command

Azure DB:
Scaffold-DbContext "Server=tcp:sfab1zdod0.database.windows.net,1433;Database=AlgoSystems;User ID=RGoll@sfab1zdod0.database;Password=TradingIQ!;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models

Scaffold-DbContext "Server=(local);Database=AlgoSystems;Trusted_Connection=True;MultipleActiveResultSets=False;Encrypt=false;TrustServerCertificate=False;Connection Timeout=30" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models -Force

//Scaffold-DbContext "Server=(local);Database=AlgoSystems;Trusted_Connection=True;MultipleActiveResultSets=true" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models -Force

Local DB:

2. how to enable the entity framework and add migration
>Add-Migration Initial
Which creates the initial migration folder

>Update-Database
Which updates the database

2. How to update the .dacpac file
- Right click on the database project and selecgt schema compare
- Select the local database to get the changes from
- click on the compare
- update the changes if exist

Pattern:
1. Repository Pattern

React Packages:
-----------------
npm i bootstrap 
npm i bootstrap-scss 
npm i react-bootstrap 
npm i react-icons 
npm i node-sass@4.14.1
npm i react-perfect-scrollbar
