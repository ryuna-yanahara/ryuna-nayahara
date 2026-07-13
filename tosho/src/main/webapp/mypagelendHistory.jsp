<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="java.util.*"%>
<%@ page session="true"%>

<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/result.css">

<meta charset="UTF-8">
<title>貸出履歴</title>
</head>
<body>
	<div class="container">
		<h2>貸出履歴</h2>

		<%
		String employeeNo = (String) session.getAttribute("employee_no");
		String message = (String) request.getAttribute("message");
		if (message != null) {
		%>
		<p style="color: red;"><%=message%></p>
		<%
		}
		%>
		<div class="table-wrapper">
			<div class="table-body-container">
				<table class="table-body">
					<thead>
						<tr>
							<th>図書ID</th>
							<th>図書名</th>
							<th>貸出日</th>
							<th>貸出承認者</th>
							<th>返却日</th>
							<th>返却承認者</th>
						</tr>
					</thead>
					<tbody>

						<%
						List<Map<String, Object>> historyList = (List<Map<String, Object>>) request.getAttribute("historyList");
						if (historyList != null && !historyList.isEmpty()) {
							for (Map<String, Object> h : historyList) {
						%>
						<tr>
							<td><%=h.get("book_id")%></td>
							<td><%=h.get("title")%></td>
							<td><%=h.get("lend_date")%></td>
							<td><%=h.get("lend_approver")%></td>
							<td><%=h.get("return_date") == null ? "未返却" : h.get("return_date")%></td>
							<td><%=h.get("return_approver") == null ? "-" : h.get("return_approver")%></td>
						</tr>
						<%
						}
						} else {
						%>
						<tr>
							<td colspan="6">データがありません</td>
						</tr>
						<%
}
%>
					</tbody>
				</table>
				<br> <a href="./html/home.html">←ホーム画面へ戻る</a>

				<aside class="links">
					<nav class="_links-list">
						<a href="home.html"><span class="material-symbols-outlined">home</span></a>
						<a href="../Mypage.jsp"><span
							class="material-symbols-outlined">person</span></a> <a
							href="../login.jsp"><span class="material-symbols-outlined">logout</span></a>
					</nav>
				</aside>
			</div>
		</div>
</body>
</html>