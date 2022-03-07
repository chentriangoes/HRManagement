const inquirer = require("inquirer");
const table = require("console.table");
// MySQL Connection
const connection = require("./config/connection");
// Prompts
const prompt = require("./config/prompts");

// START APPLICATION to launch the app
firstPrompt();

// INITIAL PROMPT
function firstPrompt() {
	// Main Menu
	inquirer.prompt(prompt.firstPrompt).then(function ({ task }) {
		switch (task) {
			case "View All Employees":
				viewEmployee();
				break; // ⛔
            case "Add Employee":
                addEmployee();
                break; // ⛔ 
            case "Update Employee Role":
                updateEmployeeRole();
                break; // ⛔
            case "View ALL Roles":
                viewRoles();
                break; // ⛔
            case "Add Role":
                addRole();
                break; // ⛔
            case "View All Departments":
                viewDepartments();
                break; // ⛔
            case "Add Department":
                addDepartment();
                break; // ⛔
			case "View Employees by Manager":
				viewEmployeeByManager();
				break; // ⛔
			case "View Employees by Department":
				viewEmployeeByDepartment();
				break; // ⛔
            case "Exit":
                console.log(
                    `\n“I'll see you to be back!"\n`,
                    );
                connection.end();
                break; // ⛔
		}
	});
}

// VIEW EMPLOYEES
function viewEmployee() {
	console.log("");

	var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`;

	connection.query(query, function (err, res) {
		if (err) throw err;

		console.table(res);

		firstPrompt();
	});
}

// ADD EMPLOYEE
const addEmployee = () => {
	// Select Employee's Department
	let departmentArray = [];
	connection.query(`SELECT * FROM department`, (err, res) => {
		if (err) throw err;

		res.forEach((element) => {
			departmentArray.push(`${element.id} ${element.name}`);
		});
		// Select Employee's Role
		let roleArray = [];
		connection.query(`SELECT id, title FROM role`, (err, res) => {
			if (err) throw err;

			res.forEach((element) => {
				roleArray.push(`${element.id} ${element.title}`);
			});
			// Select Employee's Manager
			let managerArray = [];
			connection.query(
				`SELECT id, first_name, last_name FROM employee`,
				(err, res) => {
					if (err) throw err;
					res.forEach((element) => {
						managerArray.push(
							`${element.id} ${element.first_name} ${element.last_name}`,
						);
					});
					// Create New Employee
					inquirer
						.prompt(
							prompt.insertEmployee(departmentArray, roleArray, managerArray),
						)
						.then((response) => {
							// Insert chosen elements into employee array
							let roleCode = parseInt(response.role);
							let managerCode = parseInt(response.manager);
							connection.query(
								"INSERT INTO employee SET ?",
								{
									first_name: response.firstName,
									last_name: response.lastName,
									role_id: roleCode,
									manager_id: managerCode,
								},
								(err, res) => {
									if (err) throw err;
									console.log("\n" + res.affectedRows + " employee created");
									viewEmployee();
								},
							);
						});
				},
			);
		});
	});
};

// UPDATE EMPLOYEE ROLE
const updateEmployeeRole = () => {
	// Select Employee to update
	let employees = [];
	connection.query(
		`SELECT id, first_name, last_name
  FROM employee`,
		(err, res) => {
			if (err) throw err;

			res.forEach((element) => {
				employees.push(
					`${element.id} ${element.first_name} ${element.last_name}`,
				);
			});
			// Select employee's new role
			let job = [];
			connection.query(`SELECT id, title FROM role`, (err, res) => {
				if (err) throw err;

				res.forEach((element) => {
					job.push(`${element.id} ${element.title}`);
				});

				inquirer.prompt(prompt.updateRole(employees, job)).then((response) => {
					// Update Employee with Chosen Role
					let idCode = parseInt(response.update);
					let roleCode = parseInt(response.role);
					connection.query(
						`UPDATE employee SET role_id = ${roleCode} WHERE id = ${idCode}`,
						(err, res) => {
							if (err) throw err;

							console.log(
								"\n" + "\n" + res.affectedRows + " Updated successfully!",
							);
							firstPrompt();
						},
					);
				});
			});
		},
	);
};

// VIEW ROLES
function viewRoles() {
	var query = "SELECT * FROM role";
	connection.query(query, function (err, res) {
		if (err) throw err;
		console.log(`\nROLES:\n`);
		res.forEach((role) => {
			console.log(
				`ID: ${role.id} | Title: ${role.title}\n Salary: ${role.salary}\n`,
			);
		});
		firstPrompt();
	});
}

// ADD ROLE
function addRole() {
	var query = `SELECT * FROM department`;

	connection.query(query, function (err, res) {
		if (err) throw err;
		// Select department for role
		const departmentChoices = res.map(({ id, name }) => ({
			value: id,
			name: `${id} ${name}`,
		}));

		inquirer
			.prompt(prompt.insertRole(departmentChoices))
			.then(function (answer) {
				var query = `INSERT INTO role SET ?`;
				// Insert Title, Salary and Department into Role Array
				connection.query(
					query,
					{
						title: answer.roleTitle,
						salary: answer.roleSalary,
						department_id: answer.departmentId,
					},
					function (err, res) {
						if (err) throw err;

						console.log("\n" + res.affectedRows + " role created");

						viewRoles();
					},
				);
			});
	});
}

// VIEW DEPARTMENTS
function viewDepartments() {
	var query = "SELECT * FROM department";
	connection.query(query, function (err, res) {
		if (err) throw err;

		console.log(`\nDEPARTMENTS:\n`);

		res.forEach((department) => {
			console.log(`ID: ${department.id} | ${department.name} Department`);
		});

		firstPrompt();
	});
}

// ADD DEPARTMENT
function addDepartment() {
	inquirer.prompt(prompt.insertDepartment).then(function (answer) {
		var query = "INSERT INTO department (name) VALUES ( ? )";
		connection.query(query, answer.department, function (err, res) {
			if (err) throw err;
			console.log(
				`You have added this department: ${answer.department.toUpperCase()}.`,
			);
		});
		viewDepartments();
	});
}

// VIEW EMPLOYEE BY MANAGER
function viewEmployeeByManager() {
	console.log("");

	var query = `SELECT e.manager_id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r
	ON e.role_id = r.id
  	LEFT JOIN department d
  	ON d.id = r.department_id
  	LEFT JOIN employee m
	ON m.id = e.manager_id GROUP BY e.manager_id`;

	connection.query(query, function (err, res) {
		if (err) throw err;

		// Select manager to view subordinates
		const managerChoices = res
			// Filter NULL (prevents selecting employees with no assigned manager)
			.filter((mgr) => mgr.manager_id)
			.map(({ manager_id, manager }) => ({
				value: manager_id,
				name: manager,
			}));

		inquirer
			.prompt(prompt.viewManagerPrompt(managerChoices))
			.then(function (answer) {
				var query = `SELECT e.id, e.first_name, e.last_name, r.title, CONCAT(m.first_name, ' ', m.last_name) AS manager
			FROM employee e
			JOIN role r
			ON e.role_id = r.id
			JOIN department d
			ON d.id = r.department_id
			LEFT JOIN employee m
			ON m.id = e.manager_id
			WHERE m.id = ?`;

				connection.query(query, answer.managerId, function (err, res) {
					if (err) throw err;

					console.table("\nManager's subordinates:", res);

					firstPrompt();
				});
			});
	});
}

// VIEW EMPLOYEE BY DEPARTMENT
function viewEmployeeByDepartment() {

	var query = `SELECT d.id, d.name
	FROM employee e
	LEFT JOIN role r
	ON e.role_id = r.id
	LEFT JOIN department d
	ON d.id = r.department_id
	GROUP BY d.id, d.name`;

	connection.query(query, function (err, res) {
		if (err) throw err;

		// Select department
		const departmentChoices = res.map((data) => ({
			value: data.id,
			name: data.name,
		}));

		inquirer
			.prompt(prompt.departmentPrompt(departmentChoices))
			.then(function (answer) {
				var query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
			FROM employee e
			JOIN role r
				ON e.role_id = r.id
			JOIN department d
			ON d.id = r.department_id
			WHERE d.id = ?`;

				connection.query(query, answer.departmentId, function (err, res) {
					if (err) throw err;

					console.table("\nDepartment Role: ", res);

					firstPrompt();
				});
			});
	});
}



