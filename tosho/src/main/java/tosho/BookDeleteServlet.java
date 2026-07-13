package tosho;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/BookDeleteServlet")

public class BookDeleteServlet extends HttpServlet{
	protected void
	doPost(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		request.setCharacterEncoding("UTF-8");
		String bookIdStr = request.getParameter("book_id");
		if (bookIdStr == null || bookIdStr.isEmpty()) {
			response.sendRedirect("BookListServlet");
			return;
		}
		int bookId = Integer.parseInt(bookIdStr);
		
		try {
			Class.forName("org.postgresql.Driver");
			Connection con = DriverManager.getConnection(
					"jdbc:postgresql://localhost:5432/tosho", "postgres", "artnerhr");
			String sql = "DELETE FROM books WHERE book_id = ?";
			PreparedStatement ps = con.prepareStatement(sql);
			ps.setInt(1, bookId);
			int rows = ps.executeUpdate();
			ps.close();
			con.close();
			
			System.out.println("削除成功："+ rows + "件");
		} catch(Exception e) {
			e.printStackTrace();
		}
		response.sendRedirect(request.getContextPath() + "/BookListServlet");
	}
}
