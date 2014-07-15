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

package com.bstek.dorado.view.socket;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-22
 */
public interface Socket {
	String getId();

	boolean isConnected();

	void send(Message message) throws Exception;

	Message receive() throws Exception;

	void disconnect() throws Exception;

	void addSendListener(SocketSendListener listener);

	void removeSendListener(SocketSendListener listener);

	void addReceiveListener(SocketReceiveListener listener);

	void removeReceiveListener(SocketReceiveListener listener);

	void addConnectionListener(SocketConnectionListener listener);

	void removeConnectionListener(SocketConnectionListener listener);
}
