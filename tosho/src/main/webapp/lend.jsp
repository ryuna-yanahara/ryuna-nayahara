<%@ page contentType="text/html; charset=UTF-8" %>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>貸出登録</title>
</head>
<body>
<h2>貸出登録</h2>

<form action="LendServlet" method="post">
<label>図書ID:</label>
<input type="text" name="book_id" required><br>

<label>借りる社員番号:</label>
<input type="text" name="employee_no" required><br>

<label>承認者社員番号:</label>
<input type="text" name="approver_no" required><br>
<button type="submit">貸出登録</button>
</form>

<% String msg = (String)
request.getAttribute("message");
if (msg != null){ %>
	<p><%= msg %></p>
	<%
}
%>
</body>
</html>