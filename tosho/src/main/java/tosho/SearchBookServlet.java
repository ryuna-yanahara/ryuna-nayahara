package tosho;


import java.io.IOException;
import java.util.List;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/SearchBookServlet")
public class SearchBookServlet extends HttpServlet{
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException,
	IOException{
		
		request.setCharacterEncoding("UTF-8");
		String keyword =
				request.getParameter("keyword");
		String sort =
				request.getParameter("sort");
		
		System.out.print("Servletで受け取ったsort"+sort);
		
		BookDAO dao = new BookDAO();
		List<Book> books = 
				dao.searchBooks(keyword, sort);
		
		request.setAttribute("books", books);
		request.setAttribute("keyword", keyword);
		request.setAttribute("sort", sort);
		
		RequestDispatcher dispatcher =
				request.getRequestDispatcher("result.jsp");
		
		dispatcher.forward(request, response);
	}
}
