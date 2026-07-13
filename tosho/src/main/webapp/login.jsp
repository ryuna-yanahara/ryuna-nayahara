<%@ page contentType="text/html; charset=UTF-8" %>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>ログインページ</title>
	<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/css/login.css">
</head>

<body>
	<div class="login-container">
		
		
		<div class="login-form">
			<h2>LOGIN</h2>
			<form action="<%=request.getContextPath()%>/LoginServlet" method="post">
				<label>EMPLOYEE NUMBER</label>
				<input type="text" name="employee_no" required><br><br>
				
				<label>PASSWORD</label>
				<input type="password" name="password" required><br><br>
				
				<button type="submit">LAUNCH</button>
			</form>
	
			<% String error = (String) request.getAttribute("error"); %>
			<% if (error != null){ %>
				<p style="color:white;"><%= error %></p>
			<% } %>
		</div>
		<div class="right-img"></div>
	</div>
</body>
</html>