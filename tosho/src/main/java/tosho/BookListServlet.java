//ホーム画面から遷移させるのはjspじゃなくてこのサーブレットファイルにしてください

package tosho;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/BookListServlet")

public class BookListServlet extends HttpServlet{
	@Override
	protected void
	doGet(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		String sort = request.getParameter("sort");
		String order = request.getParameter("order");
		if (sort == null) sort = "book_id";
		if (order == null) order = "ASC";
		
		BookListDAO dao = new BookListDAO();
		List<BookList> list = dao.getAllBooks(sort, order);
		
		request.setAttribute("books", list);
		request.setAttribute("sort", sort);
		request.setAttribute("order", order);
		
		RequestDispatcher rd = request.getRequestDispatcher("Kanri.jsp");
		rd.forward(request, response);
	}
}
