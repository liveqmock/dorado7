/*
 * This file is part of Dorado 7.x (http://dorado7.bsdn.org).
 * 
 * Copyright (c) 2002-2012 BSTEK Corp. All rights reserved.
 * 
 * This file is dual-licensed under the AGPLv3 (http://www.gnu.org/licenses/agpl-3.0.html) 
 * and BSDN commercial (http://www.bsdn.org/licenses) licenses.
 * 
 * If you are unsure which license is appropriate for your use, please contact the sales department
 * at http://www.bstek.com/contact.
 */

package com.bstek.dorado.console.authentication;

import java.io.Writer;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.ObjectNode;
import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.console.Constants;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.web.ConsoleUtils;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.loader.ConsoleStartedMessageOutputter;
import com.bstek.dorado.web.loader.ConsoleStartedMessagesOutputter;

/**
 * 默认登陆支持类
 * 
 * <pre>
 * web服务启动时如果用户配置了控制台了用户名、密码
 * 则按照用户所配置信息进行分配权限，
 * 如果管理员没有在配置文件配置用户名密码或者配置错误
 * 则自动创建一个名为administrator密码位随机值的用户
 * 并打印在控制台管理员可以通过查看控制台日志获得权限分配信息
 * </pre>
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * 
 */
public class DefaultAuthenticationManager implements AuthenticationManager,
		InitializingBean {
	
	private static final int DEFAULT_PASSWORD_LENGTH = 6;

	private ConsoleStartedMessagesOutputter consoleStartedMessagesOutputter;
	private List<User> users = new ArrayList<User>();

	public void setConsoleStartedMessagesOutputter(
			ConsoleStartedMessagesOutputter consoleStartedMessagesOutputter) {
		this.consoleStartedMessagesOutputter = consoleStartedMessagesOutputter;
	}

	public boolean authenticate(String name, String password) {

		boolean v = false;
		for (User user : users) {
			v = user.getName().equals(name)
					&& user.getPassword().equals(password);
			if (v)
				break;
		}
		DoradoContext ctx = DoradoContext.getCurrent();
		ctx.setAttribute(DoradoContext.SESSION,
				Constants.S_DORADO_CONSOLE_LOGIN_STATUS, Boolean.valueOf(v));

		return v;
	}

	public boolean isAuthenticated(HttpServletRequest request) {
		Boolean loginStatus = false;
		try {
			loginStatus = Boolean.valueOf((Boolean) request.getSession()
					.getAttribute(Constants.S_DORADO_CONSOLE_LOGIN_STATUS));
		} catch (Exception e) {
			
		}
		return loginStatus;
	}

	private void initProperties() {
		String adminsJSON = Configure.getString("dorado.concole.users");
		ObjectMapper mapper = JsonUtils.getObjectMapper();
		try {
			if (adminsJSON == null) {
				throw new Exception();
			}
			ArrayNode arrayNode = (ArrayNode) mapper.readTree(adminsJSON);
			for (Iterator<JsonNode> it = arrayNode.iterator(); it.hasNext();) {
				ObjectNode item = (ObjectNode) it.next();
				String name = JsonUtils.getString(item, "user");
				String password = JsonUtils.getString(item, "password");
				users.add(new User(name, password));
			}
		} catch (Exception e) {
			int length = Long.valueOf(
					Configure.getLong("dorado.console.password.length",
							DEFAULT_PASSWORD_LENGTH)).intValue();
			if (length < 1) {
				ConsoleUtils
						.outputLoadingInfo("Invalid Password Length, Generating a default length password...");
				length = DEFAULT_PASSWORD_LENGTH;
			}
			String password = KeyGenerator.randomKey(length);

			String name = "admin";
			users.add(new User(name, password));
		}

		consoleStartedMessagesOutputter
				.addMessageOutputter(new ConsoleStartedMessageOutputter() {

					@Override
					public int getOrder() {
						return 900;
					}

					@Override
					public void output(Writer writer) throws Exception {
						for (User user : users) {
							writer.append(String
									.format("Console administrator [ Account: %s, Password: %s ]",
											user.getName(), user.getPassword()));
						}
					}
				});
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		initProperties();
	}
}

/**
 * 随机码生成器
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * 
 */
class KeyGenerator {
	private static char[] chars = { '0', '1', '2', '3', '4', '5', '6', '7',
			'8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
			'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
			'y', 'z' };

	public static String randomKey(int length) {
		if (length < 1) {
			return "";
		}
		StringBuffer buffer = new StringBuffer();
		Random random = new Random();
		int i = 0;
		do {
			buffer.append(chars[random.nextInt(chars.length)]);
			i++;
		} while (i < length);
		return buffer.toString();
	}

}

class User {
	private String name;
	private String password;

	public User(String name, String password) {
		this.name = name;
		this.password = password;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
