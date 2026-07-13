package tosho;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class BookDAO {
		private static final String URL ="jdbc:postgresql://localhost:5432/tosho";
		private static final String USER ="postgres";
		private static final String PASSWORD ="artnerhr";
		
		public List<Book>
	searchBooks(String keyword, String sort){
			List<Book> list =new ArrayList<>();
			
			try {
				Class.forName("org.postgresql.Driver");
			} catch (ClassNotFoundException e) {
				e.printStackTrace();
				return list;
			}
			
			String baseSql = "SELECT book_id, title, author, publisher, publish_year FROM books WHERE title ILIKE ? OR author ILIKE ? OR publisher ILIKE ? ";
			
			String orderClause = switch (sort) {
			case "author" -> "ORDER BY author";
			case "publisher" -> "ORDER BY publisher";
			case "publish_year" -> "ORDER BY publish_year DESC";
			default -> "ORDER BY title";
			};
			
			String sql = baseSql + orderClause;
			
			try(Connection con = DriverManager.getConnection(URL, USER, PASSWORD);
					PreparedStatement ps = con.prepareStatement(sql)){
				
				String pattern = "%" + keyword + "%";
				
				ps.setString(1, pattern);
				ps.setString(2, pattern);
				ps.setString(3, pattern);
				
				ResultSet rs = ps.executeQuery();
				
				while (rs.next()) {
					Book b = new Book();
					
					b.setBookId(rs.getInt("book_id"));
					b.setTitle(rs.getString("title"));
					b.setAuthor(rs.getString("author"));
					b.setPublisher(rs.getString("publisher"));
					b.setPublishYear(rs.getInt("publish_year"));
					
					list.add(b);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
			return list;
			
			
		}
	}
