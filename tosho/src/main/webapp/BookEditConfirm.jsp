<%@ page contentType="text/html; charset=UTF-8" %>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>編集確認</title>
</head>
<body>
	<h2>入力内容の確認</h2>
	
	<%
	request.setCharacterEncoding("UTF-8");
	String bookId = request.getParameter("book_id");
	String title = request.getParameter("title");
	String author = request.getParameter("author");
	String publisher = request.getParameter("publisher");
	String yearStr = request.getParameter("publish_year");
	
	boolean hasError = false;
	String titleErr = "", authorErr = "",
			publisherErr = "", yearErr = "";
	
	
if (title == null || title.trim().isEmpty()){
	titleErr = "タイトルを入力してください";
	hasError = true;
}
if (author == null || author.trim().isEmpty()){
	authorErr = "著者を入力してください";
	hasError = true;
}
if (publisher == null || publisher.trim().isEmpty()){
	publisherErr = "出版社を入力してください";
	hasError = true;
}
if (yearStr == null || yearStr.trim().isEmpty()){
	yearErr = "発行年を入力してください";
	hasError = true;
}
%>

<form action="BookUpdateServlet" method="post">
<input type="hidden" name="book_id" value="<%= bookId %>">
<p>タイトル:
<input type="text" name="title" value="<%= title %>">
<% if (!titleErr.isEmpty()){
	%><span class="error"><%= titleErr %></span><% } %>
</p>
<p>著者:
<input type="text" name="author" value="<%= author %>">
<% if (!authorErr.isEmpty()){
	%><span class="error"><%= authorErr %></span><% } %>
</p>
<p>出版社:
<input type="text" name="publisher" value="<%= publisher %>">
<% if (!publisherErr.isEmpty()){
	%><span class="error"><%= publisherErr %></span><% } %>
</p>
<p>発行年:
<input type="text" name="publish_year" value="<%= yearStr %>">
<% if (!yearErr.isEmpty()){
	%><span class="error"><%= yearErr %></span><% } %>
</p>

<% if (hasError){ %>
<p class="error">入力内容に誤りがあります</p>
<button type="button" onclick="history.back()">戻る</button>
<% } else { %>
<button type="submit">更新</button>
<button type="button" onclick="location.href='BookListServlet'">キャンセル</button>
<% } %>

</form>

</body>
</html>