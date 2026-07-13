<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="java.util.*"%>

<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/result.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/lendhistory.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/index.css">
<meta charset="UTF-8">
<title>貸出履歴</title>
</head>
<body>
	<h2>貸出履歴</h2>
	<form action="LendHistoryServlet" method="get">
		<label>社員番号で検索</label>
		<div class="gradient-input-wrapper">
			<input type="text" name="employee_no">
		</div>
		<button type="submit">検索</button>
	</form>

	<%
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
						<th>追番</th>
						<th>図書ID</th>
						<th>図書名</th>
						<th>社員番号</th>
						<th>氏名</th>
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
						<td><%=h.get("seq")%></td>
						<td><%=h.get("book_id")%></td>
						<td><%=h.get("title")%></td>
						<td><%=h.get("employee_no")%></td>
						<td><%=h.get("name")%></td>
						<td><%=h.get("lend_date")%></td>
						<td><%=h.get("lend_approver")%></td>
						<td><%=h.get("return_date") == null ? "未返却" : h.get("return_date")%></td>
						<td><%=h.get("return_approver") == null ? "-" : h.get("return_approver")%></td>
					</tr>
					<%
					}
					} else {
					%>
				</tbody>
			</table>
		</div>
	</div>
	<tr>
		<td colspan="9">データがありません</td>
	</tr>
	<%
}
%>
	</table>
	<aside class="links">
		<nav class="_links-list">
			<a href="${pageContext.request.contextPath }/html/kanrisya_home.html"><span
				class="material-symbols-outlined">home</span></a> <a href="Mypage.jsp"><span
				class="material-symbols-outlined">person</span></a> <a href="login.jsp"><span
				class="material-symbols-outlined">logout</span></a>
		</nav>
	</aside>
</body>
</html>