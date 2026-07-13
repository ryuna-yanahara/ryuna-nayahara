<%@ page import="java.util.*,tosho.Book"%>
<%@ page contentType="text/html; charset=UTF-8"%>
<%
List<Book> books = (List<Book>) request.getAttribute("books");
String keyword = (String) request.getAttribute("keyword");
String sort = (String) request.getAttribute("sort");
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/result.css">
<title>検索結果</title>
</head>
<body>
	<h2>
		「<%=keyword%>」の検索結果
	</h2>
	<a href="index.jsp">←検索画面に戻る</a>
	<br>
	<br>

	<p>
		並び順:<%=sort%></p>

	<%
	if (books == null || books.isEmpty()) {
	%>
	<p class="no-result">該当する本が見つかりませんでした。</p>
	<%
	} else {
	%>
	<div class="table-wrapper">
		<div class="table-body-container">
			<table class="table-body">
				<thead>
					<tr>
						<th>ID</th>
						<th>タイトル</th>
						<th>著者</th>
						<th>出版社</th>
						<th>発行年</th>
					</tr>
				</thead>
				<tbody>
					<%
					for (Book b : books) {
					%>
					<tr>
						<td><%=b.getBookId()%></td>
						<td><%=b.getTitle()%></td>
						<td><%=b.getAuthor()%></td>
						<td><%=b.getPublisher()%></td>
						<td><%=b.getPublishYear()%></td>
					</tr>
					<%
					}
					%>
				</tbody>
			</table>
		</div>
	</div>

	<%
	}
	%>
	<aside class="links">
		<nav class="_links-list">
			<a href="${pageContext.request.contextPath }/html/home.html"><span class="material-symbols-outlined">home</span></a>
			<a href="Mypage.jsp"><span class="material-symbols-outlined">person</span></a>
			<a href="login.jsp"><span class="material-symbols-outlined">logout</span></a>
		</nav>
	</aside>
</body>

</html>