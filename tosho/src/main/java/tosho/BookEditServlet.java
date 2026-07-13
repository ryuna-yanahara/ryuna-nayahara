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


@WebServlet("/BookEditServlet")
public class BookEditServlet extends HttpServlet{
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		request.setCharacterEncoding("UTF-8");
		String bookIdStr = request.getParameter("book_id");
		
		if (bookIdStr == null || bookIdStr.isEmpty()) {
			response.sendRedirect("BookListServlet");
			
			return;
		}
		try {
			int bookId = Integer.parseInt(bookIdStr);
			
			Class.forName("org.postgresql.Driver");
			Connection con = DriverManager.getConnection("jdbc:postgresql://localhost:5432/tosho", "postgres", "artnerhr");
			
			String sql = "SELECT * FROM books WHERE book_id = ?";
			PreparedStatement ps = con.prepareStatement(sql);
			ps.setInt(1, bookId);
			ResultSet rs = ps.executeQuery();
			
			if (rs.next()) {
				request.setAttribute("book_id", rs.getInt("book_id"));
				request.setAttribute("title", rs.getString("title"));
				request.setAttribute("author", rs.getString("author"));
				request.setAttribute("publisher", rs.getString("publisher"));
				request.setAttribute("publish_year", rs.getInt("publish_year"));
			}
			rs.close();
			ps.close();
			con.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		RequestDispatcher rd = request.getRequestDispatcher("BookEdit.jsp");
		rd.forward(request, response);
	}
}
