package tosho;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/LendHistoryServlet")
public class LendHistoryServlet extends HttpServlet{
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		request.setCharacterEncoding("UTF-8");
		
		String employeeNo = request.getParameter("employee_no");
		
		List<Map<String, Object>>
		historyList = new ArrayList<>();
		
		try {
			Class.forName("org.postgresql.Driver");
			Connection con = DriverManager.getConnection("jdbc:postgresql://localhost:5432/tosho", "postgres", "artnerhr");
			String sql;
			PreparedStatement ps;
			
			if (employeeNo != null && !employeeNo.isEmpty()) {
				sql = "SELECT * FROM history WHERE employee_no = ? ORDER BY lend_date DESC";
				ps = con.prepareStatement(sql);
				ps.setString(1, employeeNo);
			} else {
				sql = "SELECT * FROM history ORDER BY lend_date DESC";
				ps = con.prepareStatement(sql);
			}
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				Map<String, Object>
				record = new HashMap<>();
				record.put("seq", rs.getInt("seq"));
				record.put("book_id", rs.getInt("book_id"));
				record.put("title", rs.getString("title"));
				record.put("employee_no", rs.getString("employee_no"));
				record.put("name", rs.getString("name"));
				record.put("lend_date", rs.getDate("lend_date"));
				record.put("lend_approver", rs.getString("lend_approver"));
				record.put("return_date", rs.getDate("return_date"));
				record.put("return_approver", rs.getString("return_approver"));
				historyList.add(record);
			}
			rs.close();
			ps.close();
			con.close();
	}catch (Exception e) {
		e.printStackTrace();
		request.setAttribute("message", "データ取得エラー:" + e.getMessage());
	}
		request.setAttribute("historyList", historyList);
		request.getRequestDispatcher("lendHistory.jsp").forward(request, response);
	}
}
