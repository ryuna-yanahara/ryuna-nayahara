<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/book_insert.css">
<meta charset="UTF-8">
<title>図書登録</title>
</head>
<body>
<h2>図書登録フォーム</h2>

<form action="BookInsertServlet" method="post">
<label>図書名：</label>
<input type="text" name="title" required><br><br>
<label>著者：</label>
<input type="text" name="author"><br><br>
<label>出版社：</label>
<input type="text" name="publisher"><br><br>
<label>ISBN：</label>
<input type="text" name="isbn"><br><br>
<label>ISSN：</label>
<input type="text" name="issn"><br><br>
<label>Cコード：</label>
<input type="text" name="c_code"><br><br>
<label>訳者：</label>
<input type="text" name="translator"><br><br>
<label>分野：</label>
<input type="text" name="field"><br><br>
<label>ジャンル：</label>
<input type="text" name="genre"><br><br>
<label>発行年：</label>
<input type="number" name="publish_year"><br><br>
<label>在庫冊数：</label>
<input type="number" name="stock" required><br><br>
<label>保管場所：</label>
<input type="text" name="location" required><br><br>
<button type="submit">登録する</button>
</form>

<%
String message = (String)
request.getAttribute("message");
if (message != null){%>
<p style="color:blue;"><%= message %></p><% } %>

<aside class="links">
		<nav class="_links-list">
			<a href="${pageContext.request.contextPath }/html/kanrisya_home.html"><span class="material-symbols-outlined">home</span></a>
			<a href="Mypage.jsp"><span class="material-symbols-outlined">person</span></a>
			<a href="login.jsp"><span class="material-symbols-outlined">logout</span></a>
		</nav>
	</aside>
</body>
</html>