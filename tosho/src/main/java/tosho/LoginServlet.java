package tosho;

import java.io.IOException;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet{
	public void doPost(HttpServletRequest request, HttpServletResponse response)
	throws ServletException, IOException{
		request.setCharacterEncoding("UTF-8");
		String employeeNo = request.getParameter("employee_no");
		String password = request.getParameter("password");
		
		
		UserDAO dao = new UserDAO();
		User user = dao.login(employeeNo, password);
		if (user != null) {
			System.out.println("ログイン成功:"+user.getName());
			HttpSession session = request.getSession();
			session.setAttribute("employee_no", employeeNo);
			session.setAttribute("name", user.getName());
			session.setAttribute("loginUser", user);
			session.setAttribute("password", user.getPassword() );
			
			if (user.isAdminFlag()) {
				System.out.println("admin.jspにリダイレクトします");
				response.sendRedirect("html/kanrisya_home.html");
			}else {
				System.out.println("index.jspにリダイレクトします");
				response.sendRedirect("html/home.html");
			} return;
		}else {
			System.out.println("ログイン失敗");
			request.setAttribute("error", "社員番号またはパスワードが違います。");
			RequestDispatcher rd = request.getRequestDispatcher("login.jsp");
			rd.forward(request, response);
		}
	}
}