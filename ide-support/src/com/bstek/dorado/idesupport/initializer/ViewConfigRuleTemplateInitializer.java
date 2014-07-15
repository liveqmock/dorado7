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

package com.bstek.dorado.idesupport.initializer;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.idesupport.RuleTemplateBuilder;
import com.bstek.dorado.idesupport.RuleTemplateBuilderAware;
import com.bstek.dorado.idesupport.RuleTemplateManager;
import com.bstek.dorado.idesupport.model.ClientEvent;
import com.bstek.dorado.idesupport.template.AutoChildTemplate;
import com.bstek.dorado.idesupport.template.AutoPropertyTemplate;
import com.bstek.dorado.idesupport.template.AutoRuleTemplate;
import com.bstek.dorado.idesupport.template.LazyReferenceTemplate;
import com.bstek.dorado.idesupport.template.PropertyTemplate;
import com.bstek.dorado.idesupport.template.RuleTemplate;
import com.bstek.dorado.view.config.definition.ComponentDefinition;
import com.bstek.dorado.view.registry.AssembledComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.ComponentTypeRegistry;
import com.bstek.dorado.view.registry.LayoutTypeRegisterInfo;
import com.bstek.dorado.view.registry.LayoutTypeRegistry;
import com.bstek.dorado.view.registry.VirtualEventDescriptor;
import com.bstek.dorado.view.registry.VirtualPropertyAvialableAt;
import com.bstek.dorado.view.registry.VirtualPropertyDescriptor;
import com.bstek.dorado.view.widget.Component;
import com.bstek.dorado.view.widget.Control;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-12-9
 */
public class ViewConfigRuleTemplateInitializer implements
		RuleTemplateInitializer, RuleTemplateBuilderAware {
	private static final int DEFAULT_INVISIBLE_COMPONENT_CLIENT_TYPE = ClientType
			.parseClientTypes(new int[] { ClientType.DESKTOP, ClientType.TOUCH });

	private LayoutTypeRegistry layoutTypeRegistry;
	private ComponentTypeRegistry componentTypeRegistry;
	private RuleTemplateBuilder ruleTemplateBuilder;

	public void setRuleTemplateBuilder(RuleTemplateBuilder ruleTemplateBuilder) {
		this.ruleTemplateBuilder = ruleTemplateBuilder;
	}

	public void setLayoutTypeRegistry(LayoutTypeRegistry layoutTypeRegistry) {
		this.layoutTypeRegistry = layoutTypeRegistry;
	}

	public void setComponentTypeRegistry(
			ComponentTypeRegistry componentTypeRegistry) {
		this.componentTypeRegistry = componentTypeRegistry;
	}

	public void initRuleTemplate(RuleTemplate ruleTemplate,
			InitializerContext initializerContext) throws Exception {
		RuleTemplateManager ruleTemplateManager = initializerContext
				.getRuleTemplateManager();

		int sortFactor = 1000;
		RuleTemplate layoutHolderTemplate = ruleTemplateManager
				.getRuleTemplate("LayoutHolder");
		for (LayoutTypeRegisterInfo registerInfo : layoutTypeRegistry
				.getRegisterInfos()) {
			String type = registerInfo.getType();
			RuleTemplate layoutRuleTemplate = new RuleTemplate(
					StringUtils.capitalize(type) + "Layout");
			layoutRuleTemplate.setNodeName(type);
			if (registerInfo.getClassType() != null) {
				layoutRuleTemplate.setType(registerInfo.getClassType()
						.getName());
			}

			if (registerInfo.getClientTypes() != 0) {
				layoutRuleTemplate
						.setClientTypes(registerInfo.getClientTypes());
			}

			layoutRuleTemplate.setSortFactor(++sortFactor);
			ruleTemplateManager.addRuleTemplate(layoutRuleTemplate);
			layoutHolderTemplate.addChild(new AutoChildTemplate(type,
					layoutRuleTemplate, null));

			RuleTemplate layoutConstraintRuleTemplate = new RuleTemplate(
					StringUtils.capitalize(type) + "LayoutConstraint");
			layoutConstraintRuleTemplate.setGlobal(true);
			if (registerInfo.getConstraintClassType() != null) {
				layoutConstraintRuleTemplate.setType(registerInfo
						.getConstraintClassType().getName());
			}
			ruleTemplateManager.addRuleTemplate(layoutConstraintRuleTemplate);
		}

		sortFactor = 2000;
		List<RuleTemplate> componentRuleTemplates = new ArrayList<RuleTemplate>();
		for (ComponentTypeRegisterInfo registerInfo : componentTypeRegistry
				.getRegisterInfos()) {
			boolean isAssembledComponent = registerInfo instanceof AssembledComponentTypeRegisterInfo;
			String name = registerInfo.getName();
			Class<? extends Component> classType = registerInfo.getClassType();

			boolean isNew = false;
			RuleTemplate componentRuleTemplate = ruleTemplateManager
					.getRuleTemplate(name);
			if (componentRuleTemplate == null) {
				componentRuleTemplate = new AutoRuleTemplate(name,
						(isAssembledComponent) ? null : classType.getName());
				componentRuleTemplate.setLabel(name);
				componentRuleTemplate.setGlobal(true);
				componentRuleTemplate.setAutoInitialize(false);
				componentRuleTemplates.add(componentRuleTemplate);
				isNew = true;
			}

			if (!Control.class.isAssignableFrom(classType)
					&& componentRuleTemplate.getClientTypes() == 0) {
				componentRuleTemplate
						.setClientTypes(DEFAULT_INVISIBLE_COMPONENT_CLIENT_TYPE);
			}

			componentRuleTemplate.setSortFactor(++sortFactor);
			componentRuleTemplate.setCategory(registerInfo.getCategory());

			if (isAssembledComponent) {
				componentRuleTemplate.setScope("public");
				componentRuleTemplate.setNodeName(name);

				AssembledComponentTypeRegisterInfo assembledComponentTypeRegisterInfo = (AssembledComponentTypeRegisterInfo) registerInfo;
				ComponentDefinition superComponentDefinition = assembledComponentTypeRegisterInfo
						.getSuperComponentDefinition();
				if (superComponentDefinition != null) {
					String superRuleName = superComponentDefinition
							.getComponentType();
					componentRuleTemplate
							.setParents(new RuleTemplate[] { ruleTemplateManager
									.getRuleTemplate(superRuleName) });

					Map<String, VirtualPropertyDescriptor> virtualProperties = assembledComponentTypeRegisterInfo
							.getVirtualProperties();
					if (virtualProperties != null) {
						for (VirtualPropertyDescriptor propertyDescriptor : virtualProperties
								.values()) {
							VirtualPropertyAvialableAt avialableAt = propertyDescriptor
									.getAvialableAt();
							if (!VirtualPropertyAvialableAt.client
									.equals(avialableAt)) {
								PropertyTemplate propertyTemplate = new AutoPropertyTemplate(
										propertyDescriptor.getName());
								if (propertyDescriptor.getType() != null) {
									propertyTemplate.setType(propertyDescriptor
											.getType().getName());
								}
								propertyTemplate
										.setDefaultValue(propertyDescriptor
												.getDefaultValue());
								if (StringUtils.isNotEmpty(propertyDescriptor
										.getReferenceComponentType())) {
									propertyTemplate
											.setReference(new LazyReferenceTemplate(
													ruleTemplateManager,
													propertyDescriptor
															.getReferenceComponentType(),
													"id"));
								}
								propertyTemplate.setHighlight(1);
								componentRuleTemplate
										.addProperty(propertyTemplate);
							}
						}
					}

					Map<String, VirtualEventDescriptor> virtualEvents = assembledComponentTypeRegisterInfo
							.getVirtualEvents();
					if (virtualEvents != null) {
						for (VirtualEventDescriptor eventDescriptor : virtualEvents
								.values()) {
							ClientEvent event = new ClientEvent();
							event.setName(eventDescriptor.getName());
							componentRuleTemplate.addClientEvent(event);
						}
					}
				} else if (classType != null) {
					componentRuleTemplate.setType(classType.getName());
				}
			} else if (classType != null) {
				componentRuleTemplate.setType(classType.getName());
			}

			if (isNew) {
				ruleTemplateManager.addRuleTemplate(componentRuleTemplate);
			}
		}

		for (RuleTemplate componentRuleTemplate : componentRuleTemplates) {
			ruleTemplateBuilder.initRuleTemplate(initializerContext,
					componentRuleTemplate);
		}
	}
}
