<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page session="true" %>

<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/Mypage.css">
	<meta charset="UTF-8">
	<title>マイページ</title>
</head>
<body>
<h1>MY PAGE</h1>

<%
String employeeNo = (String)
session.getAttribute("employee_no");
String name = (String)
session.getAttribute("name");
String message = (String)
request.getAttribute("message");
String messageType = (String)
request.getAttribute("messageType");
%>

<p><strong>社員番号:</strong><%= employeeNo != null ? employeeNo :"未取得" %></p>
<p><strong>氏名:</strong><%= name != null ? name :"未取得" %></p>
<h2>パスワード変更</h2>
<form action="PasswordChangeServlet" method="post">
<lable>現在のパスワード</lable><br>
<input type="password" name="currentPassword" required><br>
<lable>新しいパスワード</lable><br>
<input type="password" name="newPassword" required><br>
<lable>新しいパスワード(確認用)</lable><br>
<input type="password" name="confirmPassword" required><br>
<button type="submit">変更する</button><br>
</form>

<%
if (message != null){%>
<p class="<%= "success".equals(messageType) ? "success" : "message" %>">
<%= message %>
</p>
<% } %>

<aside class="links">
		<nav class="_links-list">
			<a href="${pageContext.request.contextPath }/html/home.html"><span class="material-symbols-outlined">home</span></a>
			<a href="Mypage.jsp"><span class="material-symbols-outlined">person</span></a>
			<a href="login.jsp"><span class="material-symbols-outlined">logout</span></a>
		</nav>
	</aside>
</body>
</html>