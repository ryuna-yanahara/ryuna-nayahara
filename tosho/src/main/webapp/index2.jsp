<%@ page contentType="text/html; charset=UTF-8"%>

<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/index.css">
<meta charset="UTF-8">
<title>図書検索</title>
</head>
<body>
	<h2>図書検索</h2>

	<form action="SearchBookServlet" method="get">
		<div class="input-row">
			<div class="keyword-section">
				<label>キーワード</label>
				<div class="gradient-input-wrapper">
					<input type="text" name="keyword" placeholder="タイトル・著者・出版社で検索"
						required>
				</div>
			</div>
			<div class="select-section">
				<label class="select">並び順</label>
				<div class="gradient-select-wrapper">
					<select name="sort">
						<option value="titel">タイトル</option>
						<option value="author">著者</option>
						<option value="publisher">出版社</option>
						<option value="publish_year">発行年</option>
					</select> <br>
				</div>
			</div>
		</div>

		<button type="submit">検索</button>
	</form>

	<h2>
		<新着蔵書情報>
	</h2>

	<div class="slide-container">
		<div class="slide-wrapper">
			<img class="slide" src="img/蔵書1.jpeg"> <img class="slide"
				src="img/蔵書2.jpeg"> <img class="slide" src="img/蔵書3.jpeg">
		</div>
		<div class="slide-wrapper">
			<img class="slide" src="img/蔵書1.jpeg"> <img class="slide"
				src="img/蔵書2.jpeg"> <img class="slide" src="img/蔵書3.jpeg">
		</div>
		<div class="slide-wrapper">
			<img class="slide" src="img/蔵書1.jpeg"> <img class="slide"
				src="img/蔵書2.jpeg"> <img class="slide" src="img/蔵書3.jpeg">
		</div>
	</div>

	<aside class="links">
		<nav class="_links-list">
			<a href="${pageContext.request.contextPath }/html/kanrisya_home.html"><span class="material-symbols-outlined">home</span></a>
			<a href="Mypage.jsp"><span class="material-symbols-outlined">person</span></a>
			<a href="login.jsp"><span class="material-symbols-outlined">logout</span></a>
		</nav>
	</asi


</body>
</html>