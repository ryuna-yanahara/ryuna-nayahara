package tosho;

import java.io.IOException;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/BookInsertServlet")
public class BookInsertServlet extends HttpServlet{
	protected void
	doPost(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		
		request.setCharacterEncoding("UTF-8");
		
		String title = request.getParameter("title");
		String author = request.getParameter("author");
		String publisher = request.getParameter("publisher");
		String isbn = request.getParameter("isbn");
		String issn = request.getParameter("issn");
		String cCode = request.getParameter("c_code");
		String translator = request.getParameter("translator");
		String field = request.getParameter("field");
		String genre = request.getParameter("genre");
		String publishYearStr = request.getParameter("publish_year");
		String stockStr = request.getParameter("stock");
		Integer publishYear = (publishYearStr == null || publishYearStr.isEmpty()) ? null :
			Integer.parseInt(publishYearStr);
		Integer stock = (stockStr == null || stockStr.isEmpty()) ? null :
			Integer.parseInt(stockStr);
		String location = request.getParameter("location");
		
		Book_insert book_insert = new Book_insert();
		book_insert.setTitle(title);
		book_insert.setAuthor(author);
		book_insert.setPublisher(publisher);
		book_insert.setIsbn(isbn);
		book_insert.setIssn(issn);
		book_insert.setCCode(cCode);
		book_insert.setTranslator(translator);
		book_insert.setField(field);
		book_insert.setGenre(genre);
		book_insert.setPublishYear(publishYear);
		book_insert.setStock(stock);
		book_insert.setLocation(location);
		
		BookInsertDAO dao = new BookInsertDAO();
		boolean result = dao.insertBook(book_insert);
		if (result) {
			request.setAttribute("message", "登録が完了しました");
		}else {
			request.setAttribute("message","登録に失敗しました");
		}
		
		RequestDispatcher rd = request.getRequestDispatcher("book_insert.jsp");
		rd.forward(request, response);
		
			}
}
