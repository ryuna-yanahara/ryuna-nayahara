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

@WebServlet("/LendServlet")
public class LendServlet extends HttpServlet{
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		request.setCharacterEncoding("UTF-8");
		
		String bookId = request.getParameter("book_id");
		String employeeNo = request.getParameter("employee_no");
		String approverNo = request.getParameter("approver_no");
		
		try {
			Class.forName("org.postgresql.Driver");
			Connection con = DriverManager.getConnection("jdbc:postgresql://localhost:5432/tosho", "postgres", "artnerhr");
			
			String borrowerName = null;
			String sqlUser = "SELECT name FROM users WHERE employee_no = ?";
			PreparedStatement psUser = con.prepareStatement(sqlUser);
			psUser.setString(1, employeeNo);
			ResultSet rsUser = psUser.executeQuery();
			
			if (rsUser.next()) {
				borrowerName = rsUser.getString("name");
			}
			rsUser.close();
			psUser.close();
			
			if (borrowerName == null)
			{
				request.setAttribute("message", "入力された社員番号のユーザーが見つかりません");
				request.getRequestDispatcher("lend.jsp").forward(request, response);
				con.close();
				return;
			}
			
			String title = null;
			String sqlBook = "SELECT title FROM books WHERE book_id = ?";
			PreparedStatement psBook = con.prepareStatement(sqlBook);
			psBook.setInt(1, Integer.parseInt(bookId));
			ResultSet rsBook = psBook.executeQuery();
			
			if (rsBook.next()) {
				title = rsBook.getString("title");
			}
			rsBook.close();
			psBook.close();
			
			if (title == null) {
				request.setAttribute("message", "入力されたIDの書籍が見つかりません");
				request.getRequestDispatcher("lend.jsp").forward(request, response);
				con.close();
				return;
			}
			String approverName = null;
			String sqlApprover = "SELECT name FROM users WHERE employee_no = ?";
			PreparedStatement psApprover = con.prepareStatement(sqlApprover);
			psApprover.setString(1, approverNo);
			ResultSet rsApprover = psApprover.executeQuery();
			
			if (rsApprover.next()) {
				approverName = rsApprover.getString("name");
			}
			rsApprover.close();
			psApprover.close();
			
			if (approverName == null) {
				request.setAttribute("message", "承認者の社員番号が正しくありません");
				request.getRequestDispatcher("lend.jsp").forward(request, response);
				con.close();
				return;
			}
			
			String sqlInsert = "INSERT INTO history(book_id, title, employee_no, name, lend_date, lend_approver) VALUES (?, ?, ?, ?, CURRENT_DATE, ?)";
			PreparedStatement psInsert = con.prepareStatement(sqlInsert);
			psInsert.setInt(1, Integer.parseInt(bookId));
			psInsert.setString(2, title);
			psInsert.setString(3, employeeNo);
			psInsert.setString(4, borrowerName);
			psInsert.setString(5, approverName);
			
			int result = psInsert.executeUpdate();
			psInsert.close();
			con.close();
			
			if (result > 0) {
				request.setAttribute("message", approverName + "が" + borrowerName + "へ" + title +"の貸出登録を完了しました");
			} else {
				request.setAttribute("message", "貸出登録に失敗しました");
			}
			
			
		} catch (Exception e) {
			e.printStackTrace();
			
			request.setAttribute("message", "エラー:" + e.getClass().getSimpleName() + "-" + e.getMessage());
		}
		request.getRequestDispatcher("lend.jsp").forward(request, response);
	}
}
