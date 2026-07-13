package tosho;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class BookListDAO {
	private static final String URL ="jdbc:postgresql://localhost:5432/tosho";
	private static final String USER ="postgres";
	private static final String PASSWORD ="artnerhr";
	
	public List<BookList>
	getAllBooks(String sortColumn, String sortOrder){
		List<BookList> books = new ArrayList<>();
		
		try {
			Class.forName("org.postgresql.Driver");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();}

		
		String validColmn = switch (sortColumn) {
		case "title" -> "title";
		case "publisher" -> "publisher";
		case "author" -> "author";
		case "publish_year" -> "publish_year";
		case "stock" -> "stock";
		default -> "book_id";
		};
		String validOder = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
		
		String sql = "SELECT book_id, title, publisher, author, publish_year, stock, location FROM books ORDER BY "
				+ validColmn + " " + validOder;
		
		try(Connection con = DriverManager.getConnection(URL, USER, PASSWORD);
				PreparedStatement ps = con.prepareStatement(sql);
				ResultSet rs = ps.executeQuery()){
			while (rs.next()) {
				BookList book = new BookList();
				
				book.setBookId(rs.getInt("book_id"));
				book.setTitle(rs.getString("title"));
				book.setPublisher(rs.getString("publisher"));
				book.setAuthor(rs.getString("author"));
				book.setPublishYear(rs.getInt("publish_year"));
				book.setStock(rs.getInt("stock"));
				book.setLocation(rs.getString("location"));
				books.add(book);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return books;
	}
}
