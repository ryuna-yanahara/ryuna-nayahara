package tosho;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UserDAO {
	private static final String URL ="jdbc:postgresql://localhost:5432/tosho";
	private static final String USER ="postgres";
	private static final String PASSWORD ="artnerhr";
	
	public User login(String employeeNo, String password) {
		User user = null;
		try {
		
		String sql ="SELECT * FROM users WHERE employee_no = ? AND password = ?";
		
		
			Class.forName("org.postgresql.Driver");
			System.out.println("[DEBUG]ドライバ読み込みOK");
		Connection con = DriverManager.getConnection(URL, USER, PASSWORD);
		System.out.println("[DEBUG]DB接続OK");
				PreparedStatement ps = con.prepareStatement(sql);
			ps.setString(1, employeeNo);
			ps.setString(2, password);
			System.out.println("[DEBUG]入力値 -> 社員番号:"+ employeeNo + ",パスワード:" + password);
			ResultSet rs = ps.executeQuery();
			System.out.println("[DEBUG]SQL実行完了");
			
			if (rs.next()) {
				System.out.println("[DEBUG]ログイン成功:" + rs.getString("name"));
				user = new User();
				
				user.setUserId(rs.getInt("user_id"));
				user.setEmployeeNo(rs.getString("employee_no"));
				user.setName(rs.getString("name"));
				user.setDepartment(rs.getString("department"));
				user.setAdminFlag(rs.getBoolean("admin_flag"));
			} else {
				System.out.println("[DEBUG]一致するユーザーがいません");
			}
				
				rs.close();
				ps.close();
				con.close();
			}catch (Exception e) {
				e.printStackTrace();
			}
		System.out.println("DAOから返すuser:"+ (user != null ? user.getName() : "null"));
		return user;
		}
	
}
