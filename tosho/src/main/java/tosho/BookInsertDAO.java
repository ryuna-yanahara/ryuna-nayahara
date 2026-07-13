package tosho;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class BookInsertDAO {
	private static final String URL ="jdbc:postgresql://localhost:5432/tosho";
	private static final String USER ="postgres";
	private static final String PASSWORD ="artnerhr";
	
	public boolean insertBook(Book_insert book_insert) {
		String sql = "INSERT INTO books (title, publisher, author, isbn, issn, c_code, translator, field, genre, publish_year, stock, location)"
				+"VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
		boolean result = false;
		try {
			Class.forName("org.postgresql.Driver");
			
			Connection con = DriverManager.getConnection(URL, USER, PASSWORD);
					PreparedStatement ps = con.prepareStatement(sql);
				ps.setString(1, book_insert.getTitle());
				ps.setString(2, book_insert.getPublisher());
				ps.setString(3, book_insert.getAuthor());
				ps.setString(4, book_insert.getIsbn());
				ps.setString(5, book_insert.getIssn());
				ps.setString(6, book_insert.getCCode());
				ps.setString(7, book_insert.getTranslator());
				ps.setString(8, book_insert.getField());
				ps.setString(9, book_insert.getGenre());
				if
				(book_insert.getPublishYear() != null) {
					ps.setInt(10, book_insert.getPublishYear());
				}else {
					ps.setNull(10, java.sql.Types.INTEGER);
				}
				if (book_insert.getStock() != null) {
					ps.setInt(11, book_insert.getStock());
				}else {
					ps.setNull(11, java.sql.Types.INTEGER);}
				ps.setString(12, book_insert.getLocation());
				
				int rows = ps.executeUpdate();
				result = (rows > 0);
				
				ps.close();
				con.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return result;
		}
	}
