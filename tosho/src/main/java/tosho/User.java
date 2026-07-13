package tosho;

public class User {
	private int userId;
	private String employeeNo;
	private String name;
	private String password;
	private String department;
	private boolean adminFlag;
	
	public int getUserId() { return userId; }
	public void setUserId(int userId) {this.userId = userId; }
	public String getEmployeeNo() { return employeeNo; }
	public void setEmployeeNo(String employeeNo) {this.employeeNo = employeeNo; }
	public String getName() { return name; }
	public void setName(String name) {this.name = name; }
	public String getPassword() { return password; }
	public void setPassword(String password) {this.password = password; }
	public String getDepartment() { return department; }
	public void setDepartment(String department) {this.department = department; }
	public boolean isAdminFlag() { return adminFlag; }
	public void setAdminFlag(boolean adminFlag) {this.adminFlag = adminFlag; }
	}
