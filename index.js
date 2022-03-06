const db = require("./config/connection");
const inquirer = require("inquirer");
const cTable = require("console.table");

// start employee-tracker
const startTracker = () => {
  inquirer
    .prompt({
      type: "list",
      name: "start",
      message: "Welcome! What would you like to do?",
      choices: [
        "View Departments",
        "View Employees",
        "View Roles",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Delete Department",
        "Exit",
      ],
    })
    .then(function (userInfo) {
      switch (userInfo.start) {
        case "View Departments":
          viewDepartments();
          break;
        case "View Employees":
          viewEmployees();
          break;
        case "View Roles":
          viewRoles();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Delete Department":
          deleteDepartment();
          break;
        case "Exit":
          exit();
          break;
      }
    });
};

// viewDepartments();
function viewDepartments() {
  const sql = `SELECT * FROM departments`;
  db.query(sql, function (err, res) {
    console.table(res);
    startTracker();
  });
}

// addDepartment();
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "Please enter a new department:",
      },
    ])
    .then(function (data) {
      const newDepartment = data.departmentName;
      const sql = `INSERT INTO departments (name)
    VALUES ("${newDepartment}")`;
      db.query(sql, function (err, res) {
        console.table(res);
        startTracker();
      });
    });
}

// deleteDepartment();
function deleteDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "number",
        message:
          "Please input the ID of the department you would like to delete:",
      },
    ])
    .then(function (data) {
      const department_id = data.number;
      const sql = `DELETE FROM departments WHERE id =${department_id}`;
      db.query(sql, function (err, res) {
        console.table(res);
        startTracker();
      });
    });
}

// viewEmployees();
function viewEmployees() {
  const sql = `SELECT * FROM employee`;
  db.query(sql, function (err, res) {
    console.table(res);
    startTracker();
  });
}

// addRole();
function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "Enter employee's first name:",
      },
      {
        type: "input",
        name: "lastName",
        message: "Enter employee's last name:",
      },
      {
        type: "input",
        name: "roleID",
        message: "Please enter the appropiate role ID:",
      },
      {
        type: "input",
        name: "managerID",
        message: "Please enter the appropiate manager ID:",
      },
    ])
    .then(function (data) {
      const firstName = data.firstName;
      const lastName = data.lastName;
      const roleID = data.roleID;
      const manager_id = data.managerID;
      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
      VALUES ("${firstName}", "${lastName}", ${roleID}, ${manager_id})`;
      db.query(sql, function (err, res) {
        console.table(res);
        startTracker();
      });
    });
}

// viewRoles();
function viewRoles() {
  const sql = `SELECT * FROM role`;
  db.query(sql, function (err, res) {
    console.table(res);
    startTracker();
  });
}

// addRole();
function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "titleRole",
        message: "Enter new role:",
      },
      {
        type: "input",
        name: "salaryRole",
        message: "Enter salary for new role:",
      },
      {
        type: "input",
        name: "departmentRole",
        message: "Please enter the appropiate department ID:",
      },
    ])
    .then(function (data) {
      const title = data.titleRole;
      const salary = data.salaryRole;
      const department_id = data.departmentRole;
      const sql = `INSERT INTO role (title, salary, department_id)
      VALUES ("${title}", ${salary}, ${department_id})`;
      db.query(sql, function (err, res) {
        console.table(res);
        startTracker();
      });
    });
}

// exit();
function exit() {
  console.log("Thank you for visiting. Goodbye!");
}

startTracker();
