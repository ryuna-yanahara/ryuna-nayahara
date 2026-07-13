package tosho;

public class Book {
	private int bookId;
	private String title;
	private String publisher;
	private String author;
	private int publishYear;
	
	public Book() {}
	
	public int getBookId() {
		return bookId;	}
	public void setBookId(int bookId) {
		this.bookId = bookId;	}
	
	public String getTitle() {
		return title;	}
	public void setTitle(String title) {
		this.title = title;	}
	
	public String getPublisher() {
		return publisher;	}
	public void setPublisher(String publisher) {
		this.publisher = publisher;	}
	
	public String getAuthor() {
		return author;	}
	public void setAuthor(String author) {
		this.author = author;	}
	
	public int getPublishYear() {
		return publishYear;	}
	public void setPublishYear(int publishYear) {
		this.publishYear = publishYear;	}
	
}
