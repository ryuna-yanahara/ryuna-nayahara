<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*, tosho.BookList" %>

<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/Kanri.css">
	<meta charset="UTF-8">
	<title>蔵書管理</title>
</head>
<body>
	<h2>蔵書一覧</h2>
	<form action="BookListServlet" method="get">
		<label>並び替え:</label>
		<select name="sort">
			<option value="book_id">図書ID</option>
			<option value="titel">タイトル</option>
			<option value="author">著者</option>
			<option value="publisher">出版社</option>
			<option value="publish_year">発行年</option>
			<option value="stock">在庫冊数</option>
		</select>
		<br><br>
		<select name="order">
			<option value="ASC">昇順</option>
			<option value="DESC">降順</option>
		</select>
		
		<button type="submit">ソート</button>
	</form>
	
	<table>
		<tr>
			<th>ID</th>
			<th>タイトル</th>
			<th>著者</th>
			<th>出版社</th>
			<th>発行年</th>
			<th>在庫冊数</th>
			<th>保管場所</th>
			<th>操作</th>
		</tr>
		<%
		List<BookList> books = (List<BookList>)
		request.getAttribute("books");
		if (books != null && ! books.isEmpty()){
			for (BookList b : books){ %>
			<tr>
				<td><%= b.getBookId() %></td>
				<td><%= b.getTitle() %></td>
				<td><%= b.getAuthor() %></td>
				<td><%= b.getPublisher() %></td>
				<td><%= b.getPublishYear() %></td>
				<td><%= b.getStock() %></td>
				<td><%= b.getLocation() %></td>
				<td>
				<form action="BookEditServlet" method="get" style="display:inline;">
				<input type="hidden" name="book_id" value="<%= b.getBookId() %>">
				<button>編集</button>
				</form>
				<form action="BookDelete.jsp" method="post" style="desplay:inline;">
				<input tyoe="hidden" name="book_id" value="<%= b.getBookId() %>">
				<input type="hidden" name="title" value="<%= b.getTitle() %>">
				<button type="submit">削除</button>
				</form>
				</td>
			</tr>
			<% }
		} else { %>
		<tr><td colspan="8">登録された蔵書はありません</td></tr>
		<% } %>
	</table>
	
	<button onclick="location.href='./book_insert.jsp'">新規登録</button>
	
	<aside class="links">
		<nav class="_links-list">
			<a href="${pageContext.request.contextPath }/html/kanrisya_home.html"><span class="material-symbols-outlined">home</span></a>
			<a href="Mypage.jsp"><span class="material-symbols-outlined">person</span></a>
			<a href="login.jsp"><span class="material-symbols-outlined">logout</span></a>
		</nav>
	</aside>

</body>
</html>