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

@WebServlet("/BookUpdateServlet")
public class BookUpdateServlet extends HttpServlet{
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
		throws ServletException, IOException{
			request.setCharacterEncoding("UTF-8");
			
			try {
				int bookId = Integer.parseInt(request.getParameter("book_id"));
				String title = request.getParameter("title");
				String author = request.getParameter("author");
				String publisher = request.getParameter("publisher");
				int year = Integer.parseInt(request.getParameter("publish_year"));
				
				Class.forName("org.postgresql.Driver");
				
				Connection con = DriverManager.getConnection("jdbc:postgresql://localhost:5432/tosho", "postgres", "artnerhr");
				String sql ="UPDATE books SET title = ?, author = ?, publisher = ?, publish_year = ? WHERE book_id = ?";
				PreparedStatement ps = con.prepareStatement(sql);
				ps.setString(1, title);
				ps.setString(2, author);
				ps.setString(3, publisher);
				ps.setInt(4, year);
				ps.setInt(5, bookId);
				
				int rows = ps.executeUpdate();
				
				ps.close();
				con.close();
				
				System.out.println("更新成功:"+ rows + "件");
				} catch (Exception e) {
					e.printStackTrace();
				}
			response.sendRedirect(request.getContextPath() + "/BookListServlet");
		}
}
