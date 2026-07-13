<%@ page import="java.util.*,zikken.Book" %>
<%@ page contentType="text/html; charset=UTF-8" %>
<% List<Book> books = (List<Book>)
	request.getAttribute("books");
	String keyword = (String) 
	request.getAttribute("keyword");
	String sort = (String) 
	request.getAttribute("sort");
%>

<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8">
 <title>検索結果</title>
</head>
<body>
 <h2>「<%= keyword %>」の検索結果</h2>
 <a href="index2.jsp">←検索画面に戻る</a>
 <br><br>
 
 <p>並び順:<%= sort %></p>
 
 <% if (books == null || books.isEmpty()){ %>
 <p>該当する本が見つかりませんでした。</p>
 <% }else { %>
 <table border="1">
  <tr>
   <th>ID</th>
   <th>タイトル</th>
   <th>著者</th>
   <th>出版社</th>
   <th>発行年</th>
  </tr>
  <% for (Book b : books) { %>
   <tr>
    <td><%= b.getBookId() %></td>
    <td><%= b.getTitle() %></td>
    <td><%= b.getAuthor() %></td>
    <td><%= b.getPublisher() %></td>
    <td><%= b.getPublishYear() %></td>
   </tr>
   <% } %>
 </table>
 <% } %>
</body>

</html>