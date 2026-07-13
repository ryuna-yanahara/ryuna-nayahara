package tosho;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/PasswordChangeServlet")
public class PasswordChangeServlet extends HttpServlet{
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		request.setCharacterEncoding("UTF-8");
		HttpSession session = request.getSession();
		String employeeNo = (String)
				session.getAttribute("employee_no");
		if (employeeNo == null) {
			response.sendRedirect("login.jsp");
			return;
		}
		String currentPassword = request.getParameter("currentPassword");
		String newPassword = request.getParameter("newPassword");
		String confirmPassword = request.getParameter("confirmPassword");
		
		System.out.println("受信:current="+ currentPassword + "new=" + newPassword + "confirm=" + confirmPassword);
		
		if (newPassword == null || confirmPassword == null || newPassword.isEmpty() || confirmPassword.isEmpty()) {
			request.setAttribute("message", "新しいパスワードを入力してください");
			request.setAttribute("messageType", "error");
			
			RequestDispatcher rd = request.getRequestDispatcher("Mypage.jsp");
			rd.forward(request, response);
			return;
		}
		
		if (! newPassword.equals(confirmPassword)) {
			request.setAttribute("message", "新しいパスワードが一致しません");
			request.setAttribute("messageType", "error");
			request.getRequestDispatcher("Mypage.jsp").forward(request, response);
			return;
		}
		try {
			Class.forName("org.postgresql.Driver");
			Connection con = DriverManager.getConnection("jdbc:postgresql://localhost:5432/tosho", "postgres", "artnerhr");
			
			String sql ="SELECT password FROM users WHERE employee_no = ?";
			PreparedStatement ps = con.prepareStatement(sql);
			ps.setString(1, employeeNo);
			ResultSet rs = ps.executeQuery();
			if (rs.next()) {
				String dbPassword = rs.getString("password");
				
				if (! dbPassword.equals(currentPassword)) {
					rs.close();
					ps.close();
					con.close();
				request.setAttribute("message", "現在のパスワードが正しくありません");
				request.getRequestDispatcher("Mypage.jsp").forward(request, response);
				return;
				}
				}else {
					rs.close();
					ps.close();
					con.close();
					request.setAttribute("message", "ユーザー情報が見つかりません");
					request.setAttribute("messageType", "error");
					request.getRequestDispatcher("Mypage.jsp").forward(request, response);
					return;
				}
				rs.close();
				ps.close();
				sql = "UPDATE users SET password = ? WHERE employee_no = ?";
				ps = con.prepareStatement(sql);
				ps.setString(1, newPassword);
				ps.setString(2, employeeNo);
				int rows = ps.executeUpdate();
				ps.close();
				con.close();
				if (rows > 0) {
					request.setAttribute("message", "パスワードを更新しました");
					request.setAttribute("messageType", "success");
				}else {
					request.setAttribute("message", "更新に失敗しました");
					request.setAttribute("messageType", "error");
				}
				request.getRequestDispatcher("Mypage.jsp").forward(request, response);
			} catch (Exception e) {
				e.printStackTrace();
				request.setAttribute("message", "エラーが発生しました");
				request.setAttribute("messageType", "error");
				request.getRequestDispatcher("Mypage.jsp").forward(request, response);
			}
		}
	}

