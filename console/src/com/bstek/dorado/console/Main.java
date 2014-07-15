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

package com.bstek.dorado.console;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.ObjectNode;
import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.console.addon.Addon;
import com.bstek.dorado.console.addon.AddonController;
import com.bstek.dorado.console.authentication.OpenAuthenticationManager;
import com.bstek.dorado.core.el.EvaluateMode;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.widget.Container;
import com.bstek.dorado.view.widget.base.accordion.Accordion;
import com.bstek.dorado.view.widget.base.accordion.Section;
import com.bstek.dorado.view.widget.blockview.BlockView;

/**
 * 
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2012-11-27
 */
public class Main implements InitializingBean {
	private static final Log logger = LogFactory.getLog(Main.class);
	private static final String MENU_PATH = "com/bstek/dorado/console/Menu.json";
	private static final SimpleDateFormat dataFormat = new SimpleDateFormat(
			"yyyy-MM-dd kk:mm");
	private AddonController addonController;
	private ExpressionHandler expressionHandler;
	private List<MenuGroup> menuGroups = null;

	/**
	 * @param addonController
	 *            the addonController to set
	 */
	public void setAddonController(AddonController addonController) {
		this.addonController = addonController;
	}

	/**
	 * @param expressionHandler
	 *            the expressionHandler to set
	 */
	public void setExpressionHandler(ExpressionHandler expressionHandler) {
		this.expressionHandler = expressionHandler;
	}

	/**
	 * 
	 * @param view
	 * @param accordionMenu
	 */
	public void onViewInit(View view, Accordion accordionMenu) {
		Map<String, Object> userData = new HashMap<String, Object>();
		for (MenuGroup menuGroup : menuGroups) {
			menuRenderToAccordion(accordionMenu, menuGroup);
		}
		long startTime = Setting.getStartTime();
		String date = dataFormat.format(startTime);
		boolean isOpen = Setting.getAuthenticationManager().getClass()
				.getName().equals(OpenAuthenticationManager.class.getName());

		String doradoVersion = "", name;
		try {
			Collection<Addon> addons = addonController.getAddonList();
			Iterator<Addon> iterator = addons.iterator();
			while (iterator.hasNext()) {
				Addon doradoAddon = (Addon) iterator.next();
				name = doradoAddon.getName();
				if (name.equals("dorado-core")) {
					doradoVersion = doradoAddon.getVersion();
				}
			}

		} catch (Exception e) {
			logger.error(e, e);
		}
		userData.put("doradoVersion", doradoVersion);
		userData.put("startTime", date);
		userData.put("isOpen", isOpen);

		view.setUserData(userData);
	}

	private String getFinalValue(String text) {
		Object value = expressionHandler.compile(text);
		if (value instanceof Expression
				&& ((Expression) value).getEvaluateMode() == EvaluateMode.onInstantiate) {
			return ((Expression) value).evaluate().toString();
		} else {
			return text;
		}
	}

	/**
	 * 解析菜单JSON
	 * 
	 * @param inputStream
	 * @return
	 * @throws JsonProcessingException
	 * @throws IOException
	 */
	private List<MenuGroup> parseMenu(InputStream inputStream)
			throws JsonProcessingException, IOException {
		ObjectMapper mapper = JsonUtils.getObjectMapper();
		List<MenuGroup> groups = new ArrayList<MenuGroup>();
		try {
			ArrayNode arrayNode = (ArrayNode) mapper.readTree(inputStream);
			for (Iterator<JsonNode> groupNode = arrayNode.iterator(); groupNode
					.hasNext();) {
				ObjectNode objectNode = (ObjectNode) groupNode.next();
				MenuGroup menuGroup = mapper.readValue(objectNode,
						MenuGroup.class);
				groups.add(menuGroup);
			}
		} finally {
			inputStream.close();
		}
		return groups;
	}

	/**
	 * 渲染菜单
	 * 
	 * @param accordionMenu
	 * @param menuGroup
	 */
	private void menuRenderToAccordion(Accordion accordionMenu,
			MenuGroup menuGroup) {
		Section section = new Section();
		section.setCaption(getFinalValue(menuGroup.getCaption()));
		section.setIcon(menuGroup.getIcon());
		Container container = new Container();
		BlockView blockView = new BlockView();
		blockView.setTags("menuBtn");
		Map<String, Object> style = new HashMap<String, Object>();
		style.put("padding-left", "30px");
		blockView.setStyle(style);
		container.addChild(blockView);
		List<MenuItem> itemList = menuGroup.getItems();
		List<MenuItem> items = new ArrayList<MenuItem>();
		MenuItem item = null;
		for (MenuItem menuItem : itemList) {
			item = new MenuItem(menuItem.getParent(),
					getFinalValue(menuItem.getLabel()), menuItem.getPath(),
					menuItem.getIcon(), menuItem.getOwner());
			items.add(item);
		}
		blockView.setItems(items);
		section.setControl(container);
		accordionMenu.addSection(section);
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		InputStream inputStream = Main.class.getClassLoader()
				.getResourceAsStream(MENU_PATH);
		Assert.notNull(inputStream, "Can not found resource \"" + MENU_PATH
				+ "\"!");
		try {
			menuGroups = parseMenu(inputStream);
		} catch (JsonProcessingException e) {
			logger.error(e, e);
		} catch (IOException e) {
			logger.error(e, e);
		}
	}

}

class MenuGroup {
	private String id;
	private String caption;
	private String icon;
	private List<MenuItem> items;

	/**
	 * @return the id
	 */
	public String getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(String id) {
		this.id = id;
	}

	/**
	 * @return the caption
	 */
	public String getCaption() {
		return caption;
	}

	/**
	 * @param caption
	 *            the caption to set
	 */
	public void setCaption(String caption) {
		this.caption = caption;
	}

	/**
	 * @return the icon
	 */
	public String getIcon() {
		return icon;
	}

	/**
	 * @param icon
	 *            the icon to set
	 */
	public void setIcon(String icon) {
		this.icon = icon;
	}

	/**
	 * @return the items
	 */
	public List<MenuItem> getItems() {
		return items;
	}

	/**
	 * @param items
	 *            the items to set
	 */
	public void setItems(List<MenuItem> items) {
		this.items = items;
	}

}

class MenuItem {
	private String parent;
	private String label;
	private String path;
	private String icon;
	private int owner;

	public MenuItem() {

	}

	/**
	 * @param parent
	 * @param label
	 * @param path
	 * @param icon
	 * @param owner
	 */
	public MenuItem(String parent, String label, String path, String icon,
			int owner) {
		super();
		this.parent = parent;
		this.label = label;
		this.path = path;
		this.icon = icon;
		this.owner = owner;
	}

	/**
	 * @return the parent
	 */
	public String getParent() {
		return parent;
	}

	/**
	 * @param parent
	 *            the parent to set
	 */
	public void setParent(String parent) {
		this.parent = parent;
	}

	/**
	 * @return the label
	 */
	public String getLabel() {
		return label;
	}

	/**
	 * @param label
	 *            the label to set
	 */
	public void setLabel(String label) {
		this.label = label;
	}

	/**
	 * @return the path
	 */
	public String getPath() {
		return path;
	}

	/**
	 * @param path
	 *            the path to set
	 */
	public void setPath(String path) {
		this.path = path;
	}

	/**
	 * @return the icon
	 */
	public String getIcon() {
		return icon;
	}

	/**
	 * @param icon
	 *            the icon to set
	 */
	public void setIcon(String icon) {
		this.icon = icon;
	}

	/**
	 * @return the owner
	 */
	public int getOwner() {
		return owner;
	}

	/**
	 * @param owner
	 *            the owner to set
	 */
	public void setOwner(int owner) {
		this.owner = owner;
	}


}
