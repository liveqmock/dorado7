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

package com.bstek.dorado.util;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.Configure;

/**
 * 用于生成特征码字符串的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 19, 2009
 */
public abstract class StringAliasUtils {
	private static final Log logger = LogFactory.getLog(StringAliasUtils.class);

	private static final int TOTAL_CHAR_NUM = 62;

	private static final char HEX_DIGITALS[] = { // 用来将字节转换成 16 进制表示的字符
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e',
			'f' };

	private static Map<String, String> aliasMap = new HashMap<String, String>();
	private static Map<String, String> stringMap = new HashMap<String, String>();

	private static int toOrd(char c) {
		if (c >= 'A' && c <= 'Z')
			return c - 'A';
		else if (c >= 'a' && c <= 'z')
			return c - 'a' + 26;
		else if (c >= '0' && c <= '9')
			return c - '0' + 52;
		else
			throw new IllegalArgumentException("Unsupported char [" + c + "].");
	}

	private static char toChar(int i) {
		if (i >= 0 && i < 26)
			return (char) (i + 'A');
		else if (i >= 26 && i < 52)
			return (char) (i + 'a' - 26);
		else if (i >= 52 && i < 62)
			return (char) (i + '0' - 52);
		else
			throw new IllegalArgumentException("Unsupported char code [" + i
					+ "].");
	}

	private static String toHexString(char c) {
		if (c > 127) {
			throw new IllegalArgumentException("Unsupported char [" + c + "].");
		}

		String s = Integer.toHexString(c);
		if (s.length() == 1)
			return '0' + s;
		else
			return s;
	}

	/**
	 * 为一段较长的文本生成一个相应的较短的唯一性特征码字符串。
	 */
	public static String getUniqueAlias(String s) {
		if (StringUtils.isEmpty(s)) {
			return "";
		}

		if (Configure.getBoolean("view.useStringAlias", false)) {
			String alias = stringMap.get(s);
			if (alias == null) {
				if (Configure.getBoolean("view.useRandomStringAlias", true)) {
					do {
						alias = RandomStringUtils.randomAlphanumeric(10);
					} while (aliasMap.containsKey(alias));
				} else {
					alias = generateOrganizedAlias(s);
				}
				aliasMap.put(alias, s);
				stringMap.put(s, alias);
			}
			return alias;
		} else {
			return s;
		}
	}

	private static String generateOrganizedAlias(String s) {
		String alias;
		int len = s.length();
		int[] bv = new int[len * 2];
		for (int i = 0; i < len; i++) {
			String hex = toHexString(s.charAt(i));
			bv[i * 2] = toOrd(hex.charAt(0));
			bv[i * 2 + 1] = toOrd(hex.charAt(1));
		}

		int code1 = 0, code2 = 0, code3 = 0, code4 = 1, code5 = 1, code6 = 1, code7 = 1, code8 = 1;
		for (int i = 0; i < bv.length; i++) {
			int n = bv[i];

			code1 += n;
			code1 %= TOTAL_CHAR_NUM;

			code2 += (i * n);
			code2 %= TOTAL_CHAR_NUM;

			code3 += ((bv.length - i) * n) + i;
			code3 %= TOTAL_CHAR_NUM;

			code4 *= n;
			code4 %= TOTAL_CHAR_NUM;
			if (code4 == 0)
				code4 = 1;

			code5 *= (i * (n + 1));
			code5 %= TOTAL_CHAR_NUM;
			if (code5 == 0)
				code5 = 1;

			code6 *= ((bv.length - i) * n) + i;
			code6 %= TOTAL_CHAR_NUM;
			if (code6 == 0)
				code6 = 1;

			code7 *= (i * (n + 7));
			code7 %= TOTAL_CHAR_NUM;
			if (code7 == 0)
				code7 = 1;

			code8 *= ((bv.length - i) * (n + 3));
			code8 %= TOTAL_CHAR_NUM;
			if (code8 == 0)
				code8 = 1;
		}
		StringBuffer sb = new StringBuffer(8);
		sb.append(toChar(code1)).append(toChar(code2)).append(toChar(code3))
				.append(toChar(code4)).append(toChar(code5))
				.append(toChar(code6)).append(toChar(code7))
				.append(toChar(code8));
		alias = sb.toString();

		while (aliasMap.containsKey(alias)) {
			logger.warn("The string alias [" + alias + "] -> [" + s
					+ "] is already exists.");
			alias += toChar((int) (Math.random() * TOTAL_CHAR_NUM));
		}
		return alias;
	}

	/**
	 * 根据别名返回原始的较长的文本字符串。
	 */
	public static String getOriginalString(String alias) {
		if (Configure.getBoolean("view.useStringAlias", false)) {
			return aliasMap.get(alias);
		} else {
			return alias;
		}
	}

	public static String getMD5(byte[] source) throws NoSuchAlgorithmException {
		java.security.MessageDigest md = java.security.MessageDigest
				.getInstance("MD5");
		md.update(source);
		byte tmp[] = md.digest(); // MD5 的计算结果是一个 128 位的长整数，用字节表示就是 16 个字节
		char str[] = new char[16 * 2]; // 每个字节用 16 进制表示的话，使用两个字符，所以表示成 16
										// 进制需要 32 个字符
		int k = 0; // 表示转换结果中对应的字符位置
		for (int i = 0; i < 16; i++) { // 从第一个字节开始，对 MD5 的每一个字节转换成 16
										// 进制字符的转换
			byte byte0 = tmp[i]; // 取第 i 个字节
			str[k++] = HEX_DIGITALS[byte0 >>> 4 & 0xf]; // 取字节中高 4 位的数字转换
			str[k++] = HEX_DIGITALS[byte0 & 0xf]; // 取字节中低 4 位的数字转换
		}
		return new String(str); // 换后的结果转换为字符串
	}

	public static String getMD5(String source) throws NoSuchAlgorithmException {
		return getMD5(source.getBytes());
	}
}
