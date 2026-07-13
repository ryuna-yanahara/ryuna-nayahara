<%@ page contentType="text/html; charset=UTF-8" %>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>削除確認</title>
</head>
<body>
	<h2>削除の確認</h2>
	
	<%
	String bookId = request.getParameter("book_id");
	String title = request.getParameter("title");
	
	if (bookId == null || bookId.equals("null")){
		out.println("<p>book_idが渡されていません</p>");
	}
	%>
		
	<p>「<%= title != null ? title : "(タイトル不明)"%>」を削除しますか？</p>
	
	<form action="BookDeleteServlet" method="post" style="display:inline;">
	<input type="hidden" name="book_id" value="<%= bookId != null ? bookId : "" %>">
	<button type="submit">はい</button>
	</form>
	
	<form action="BookListServlet" method="get" style="display:inline;">
	<button type="submit">いいえ</button>
	</form>

</body>
</html>