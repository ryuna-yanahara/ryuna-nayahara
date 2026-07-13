package tosho;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/ReturnServlet")
public class ReturnServlet extends HttpServlet{
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		request.setCharacterEncoding("UTF-8");
		
		String bookIdStr = request.getParameter("book_id");
		String employeeNo = request.getParameter("employee_no");
		String approverNo = request.getParameter("approver_no");
		
		try {
			Class.forName("org.postgresql.Driver");
			Connection con = DriverManager.getConnection("jdbc:postgresql://localhost:5432/tosho", "postgres", "artnerhr");
			
			if (bookIdStr == null || employeeNo == null || approverNo == null || bookIdStr.isEmpty() || employeeNo.isEmpty() || approverNo.isEmpty()) {
				request.setAttribute("message", "全ての項目を入力してください");
				request.getRequestDispatcher("return.jsp").forward(request, response);
				return;
			}
			int bookId = Integer.parseInt(bookIdStr);
			String approverName = null;
			String sqlAdmin = "SELECT name, admin_flag FROM users WHERE employee_no = ?";
			PreparedStatement psAdmin = con.prepareStatement(sqlAdmin);
			psAdmin.setString(1, approverNo);
			ResultSet rsAdmin = psAdmin.executeQuery();
			if (rsAdmin.next()) {
				boolean isAdmin = rsAdmin.getBoolean("admin_flag");
				approverName = rsAdmin.getString("name");
				if (!isAdmin) {
					request.setAttribute("message", "承認者は管理者である必要があります");
					rsAdmin.close();
					psAdmin.close();
					con.close();
					request.getRequestDispatcher("return.jsp").forward(request, response);
					return;
				}
			}
			rsAdmin.close();
			psAdmin.close();
			
			if (approverName == null) {
				request.setAttribute("message", "承認者の社員番号が正しくありません");
				request.getRequestDispatcher("return.jsp").forward(request, response);
				con.close();
				return;
			}
			String checksql = "SELECT seq FROM history WHERE book_id = ? AND employee_no = ? AND return_date IS NULL ORDER BY lend_date DESC LIMIT 1";
			PreparedStatement psCheck = con.prepareStatement(checksql);
			psCheck.setInt(1, bookId);
			psCheck.setString(2, employeeNo);
			ResultSet rsCheck = psCheck.executeQuery();
			
			if (!rsCheck.next()) {
				request.setAttribute("message", "返却対象の貸出データが見つかりません");
				rsCheck.close();
				psCheck.close();
				con.close();
				request.getRequestDispatcher("return.jsp").forward(request, response);
				return;
			}
			int seq = rsCheck.getInt("seq");
			rsCheck.close();
			psCheck.close();
			
			String sqlUpdate = "UPDATE history SET return_date = CURRENT_DATE, return_approver = ? WHERE seq = ?";
			PreparedStatement psUpdate = con.prepareStatement(sqlUpdate);
			psUpdate.setString(1, approverName);
			psUpdate.setInt(2, seq);
			int updated = psUpdate.executeUpdate();
			psUpdate.close();
			con.close();
			
			if (updated > 0) {
				request.setAttribute("message", "返却が完了しました");
			} else {
				request.setAttribute("message", "返却処理に失敗しました");
			}
;		} catch (Exception e) {
	e.printStackTrace();
	request.setAttribute("message", "エラー:" + e.getMessage());
}
		request.getRequestDispatcher("return.jsp").forward(request, response);
	}
}
