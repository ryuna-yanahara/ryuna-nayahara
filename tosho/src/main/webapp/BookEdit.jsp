<%@ page contentType="text/html; charset=UTF-8" %>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>蔵書編集</title>
</head>
<body>
<h2>蔵書編集</h2>
<form action="BookEditConfirm.jsp" method="post">
<input type="hidden" name="book_id" value="<%= request.getAttribute("book_id") %>">
<p>タイトル:<input type="text" name="title" value="<%= request.getAttribute("title") %>"></p>
<p>著者:<input type="text" name="author" value="<%= request.getAttribute("author") %>"></p>
<p>出版社:<input type="text" name="publisher" value="<%= request.getAttribute("publisher") %>"></p>
<p>発行年:<input type="text" name="publish_year" value="<%= request.getAttribute("publish_year") %>"></p>

<button type="submit">確認</button>
<button type="button" onclick="location.href='BookListServlet'">戻る</button>
</form>

</body>
</html>