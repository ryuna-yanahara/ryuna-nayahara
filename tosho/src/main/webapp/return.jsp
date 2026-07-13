<%@ page contentType="text/html; charset=UTF-8" %>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>返却処理</title>
</head>
<body>
<h2>返却処理フォーム</h2>

<form action="ReturnServlet" method="post">
<label>書籍ID:</label>
<input type="text" name="book_id"><br>

<label>借りていた社員番号:</label>
<input type="text" name="employee_no"><br>

<label>承認者社員番号:</label>
<input type="text" name="approver_no"><br>
<input type="submit" value="返却する">
</form>

<p style="color:red;">${message}</p>
</body>
</html>