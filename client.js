window.__ModuleLoader__.load({
	id: "@xthings/dsh-brand",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let { jsx, jsxs } = require("react/jsx-runtime");
		let react = require("react");

		/** Locale namespace owned by this bundle. */
		const NS = "xthings-brand";
		/** Single style element this bundle is allowed to own. */
		const STYLE_ID = "xtb-style";
		const TITLE_ID = "xtb-dialog-title";
		const KEY_ID = "xtb-key";
		const HINT_ID = "xtb-key-hint";
		const DEFAULT_BASE = "https://s2a.xthings.dev/v1";

		/** Official 182x24 brand wordmark, cropped to the lettering: the mark is drawn by another slot. */
		const WORDMARK_VIEWBOX = "26 0 156 24";
		const WORDMARK_PATHS = [
		"M68.416 18.2447H67.0501V16.1272H68.416C69.2619 16.1272 70.1166 15.9163 70.6671 15.3304C71.2181 14.7444 71.426 13.8455 71.426 12.9471C71.426 12.0487 71.2268 11.1498 70.6671 10.5643C70.1083 9.97831 69.2619 9.76744 68.416 9.76744C67.5701 9.76744 66.7154 9.97831 66.1639 10.5643C65.6129 11.1503 65.4049 12.0487 65.4049 12.9471V21.6435H63.009V7.6582H65.4049V8.54883H65.8442C65.8918 8.49393 65.9394 8.44728 65.9875 8.40064C66.5871 7.85353 67.5049 7.6582 68.4072 7.6582C69.8212 7.6582 71.2341 8.00998 72.1607 8.98662C73.0868 9.96325 73.4143 11.4632 73.4143 12.9558C73.4143 14.4485 73.0785 15.9406 72.1607 16.925C71.2424 17.9094 69.8212 18.2457 68.416 18.2457V18.2447Z",
		"M31.9551 8.03497H33.3204V10.1525H31.9551C31.1087 10.1525 30.2545 10.3633 29.7035 10.9493C29.1525 11.5353 28.945 12.4342 28.945 13.3326C28.945 14.231 29.1447 15.1294 29.7035 15.7154C30.2623 16.3014 31.1087 16.5122 31.9551 16.5122C32.8015 16.5122 33.6562 16.3014 34.2072 15.7154C34.7582 15.1294 34.9657 14.231 34.9657 13.3326V4.62842H37.3611V18.6219H34.9657V17.7313H34.5264C34.4783 17.7857 34.4307 17.8329 34.3826 17.8795C33.7835 18.4261 32.8652 18.6219 31.9629 18.6219C30.5494 18.6219 29.136 18.2707 28.2099 17.294C27.2838 16.3174 26.9563 14.817 26.9563 13.3248C26.9563 11.8327 27.2916 10.34 28.2099 9.35561C29.136 8.37898 30.5494 8.03497 31.9551 8.03497Z",
		"M49.3786 13.1431V13.9948H42.9984V12.2996H47.2305C47.1348 11.6825 46.9113 11.1043 46.5119 10.682C45.9371 10.0727 45.0503 9.85409 44.1723 9.85409C43.2943 9.85409 42.4076 10.0727 41.8328 10.682C41.258 11.2913 41.05 12.2213 41.05 13.1435C41.05 14.0658 41.2575 15.003 41.8328 15.6046C42.4076 16.2061 43.2939 16.433 44.1723 16.433C45.0508 16.433 45.9371 16.2143 46.5119 15.6046C46.5916 15.5186 46.6635 15.4248 46.7354 15.331H49.0992C48.8918 16.0657 48.5643 16.7299 48.0691 17.2454C47.111 18.2531 45.6339 18.6205 44.1723 18.6205C42.7108 18.6205 41.2337 18.2609 40.2755 17.2454C39.3174 16.2299 38.9661 14.6828 38.9661 13.1435C38.9661 11.6043 39.3096 10.0494 40.2755 9.04168C41.242 8.03396 42.7108 7.66663 44.1723 7.66663C45.6339 7.66663 47.111 8.02618 48.0691 9.04168C49.0351 10.0572 49.3786 11.6043 49.3786 13.1435V13.1431Z",
		"M61.4045 13.1431V13.9948H55.0243V12.2996H59.2564C59.1602 11.6825 58.9372 11.1043 58.5378 10.682C57.963 10.0727 57.0762 9.85409 56.1982 9.85409C55.3202 9.85409 54.4335 10.0727 53.8587 10.682C53.2839 11.2913 53.0759 12.2213 53.0759 13.1435C53.0759 14.0658 53.2834 15.003 53.8587 15.6046C54.4335 16.2061 55.3202 16.433 56.1982 16.433C57.0762 16.433 57.963 16.2143 58.5378 15.6046C58.6179 15.5186 58.6894 15.4248 58.7608 15.331H61.1251C60.9171 16.0657 60.5897 16.7299 60.0945 17.2454C59.1364 18.2531 57.6593 18.6205 56.1982 18.6205C54.7372 18.6205 53.2596 18.2609 52.3014 17.2454C51.3432 16.2299 50.9919 14.6828 50.9919 13.1435C50.9919 11.6043 51.3355 10.0494 52.3014 9.04168C53.2678 8.03396 54.7367 7.66663 56.1982 7.66663C57.6598 7.66663 59.1364 8.02618 60.0945 9.04168C61.061 10.0572 61.4045 11.6043 61.4045 13.1435V13.1431Z",
		"M80.242 18.6214C81.7035 18.6214 83.1801 18.4105 84.1383 17.809C85.0965 17.2075 85.4482 16.2931 85.4482 15.3869C85.4482 14.4807 85.1042 13.5585 84.1383 12.9647C83.1801 12.371 81.703 12.1518 80.242 12.1518C79.6186 12.1518 79.0438 12.0658 78.6366 11.8394C78.2294 11.6047 78.0778 11.2534 78.0778 10.9017C78.0778 10.5499 78.2216 10.1908 78.6366 9.9639C79.0438 9.72921 79.6749 9.65147 80.2973 9.65147C80.9198 9.65147 81.5509 9.73747 81.9591 9.9639C82.3663 10.1986 82.5179 10.5499 82.5179 10.9017H84.9531C84.9531 9.99499 84.6421 9.07327 83.7719 8.47951C82.9017 7.88576 81.5679 7.66663 80.2424 7.66663C78.9169 7.66663 77.5837 7.8775 76.713 8.47951C75.8427 9.08104 75.5308 9.99499 75.5308 10.9017C75.5308 11.8083 75.8423 12.73 76.713 13.3238C77.5832 13.9176 78.9165 14.1367 80.2424 14.1367C80.929 14.1367 81.688 14.2227 82.1428 14.4491C82.5985 14.676 82.7579 15.0351 82.7579 15.3869C82.7579 15.7387 82.5985 16.0977 82.1428 16.3246C81.688 16.5511 80.9931 16.6371 80.3066 16.6371C79.62 16.6371 78.9169 16.5511 78.4694 16.3246C78.0224 16.0982 77.8543 15.7387 77.8543 15.3869H75.0435C75.0435 16.2935 75.3865 17.2153 76.3534 17.809C77.3194 18.4028 78.7809 18.6214 80.2424 18.6214H80.242Z",
		"M97.4733 13.1431V13.9948H91.0932V12.2996H95.3252C95.23 11.6825 95.006 11.1043 94.6071 10.682C94.0313 10.0727 93.1456 9.85409 92.2666 9.85409C91.3876 9.85409 90.5018 10.0727 89.927 10.682C89.3522 11.2913 89.1452 12.2213 89.1452 13.1435C89.1452 14.0658 89.3522 15.003 89.927 15.6046C90.5018 16.2061 91.3886 16.433 92.2666 16.433C93.1446 16.433 94.0313 16.2143 94.6071 15.6046C94.6863 15.5186 94.7587 15.4248 94.8301 15.331H97.1935C96.9855 16.0657 96.6585 16.7299 96.1639 17.2454C95.2057 18.2531 93.7281 18.6205 92.2666 18.6205C90.805 18.6205 89.3284 18.2609 88.3703 17.2454C87.4121 16.2299 87.0613 14.6828 87.0613 13.1435C87.0613 11.6043 87.4043 10.0494 88.3703 9.04168C89.3367 8.03396 90.806 7.66663 92.2666 7.66663C93.7272 7.66663 95.2057 8.02618 96.1639 9.04168C97.1298 10.0572 97.4729 11.6043 97.4729 13.1435L97.4733 13.1431Z",
		"M109.499 13.1431V13.9948H103.119V12.2996H107.351C107.256 11.6825 107.032 11.1043 106.632 10.682C106.057 10.0727 105.172 9.85409 104.293 9.85409C103.414 9.85409 102.528 10.0727 101.953 10.682C101.378 11.2913 101.17 12.2213 101.17 13.1435C101.17 14.0658 101.378 15.003 101.953 15.6046C102.528 16.2061 103.415 16.433 104.293 16.433C105.171 16.433 106.057 16.2143 106.632 15.6046C106.712 15.5186 106.784 15.4248 106.856 15.331H109.22C109.012 16.0657 108.685 16.7299 108.19 17.2454C107.231 18.2531 105.754 18.6205 104.293 18.6205C102.831 18.6205 101.355 18.2609 100.396 17.2454C99.4382 16.2299 99.0864 14.6828 99.0864 13.1435C99.0864 11.6043 99.4295 10.0494 100.396 9.04168C101.362 8.03396 102.832 7.66663 104.293 7.66663C105.754 7.66663 107.231 8.02618 108.19 9.04168C109.156 10.0572 109.499 11.6043 109.499 13.1435V13.1431Z",
		"M113.5 4.62817H111.104V18.6217H113.5V4.62817Z",
		"M117.589 12.8154L121.517 18.6208H118.554L114.625 12.8154L118.554 8.15088H121.517L117.589 12.8154Z",
		"M23.0584 4.95203C22.8129 4.83203 22.7074 5.06103 22.5639 5.17704C22.5149 5.21454 22.4734 5.26354 22.4319 5.30854C22.0734 5.69155 21.6543 5.94306 21.1073 5.91306C20.3073 5.86806 19.6243 6.11957 19.0203 6.73158C18.8918 5.97706 18.4652 5.52655 17.8162 5.23754C17.4767 5.08753 17.1332 4.93703 16.8952 4.61052C16.7292 4.37801 16.6837 4.11901 16.6007 3.8635C16.5477 3.70949 16.4952 3.55199 16.3177 3.52549C16.1252 3.49549 16.0497 3.65699 15.9742 3.792C15.6722 4.34401 15.5552 4.95203 15.5667 5.56805C15.5932 6.95359 16.1782 8.05712 17.3407 8.84215C17.4727 8.93215 17.5067 9.02215 17.4652 9.15366C17.3857 9.42416 17.2917 9.68667 17.2087 9.95718C17.1557 10.1297 17.0767 10.1677 16.8917 10.0922C16.2537 9.82568 15.7027 9.43117 15.2156 8.95465C14.3891 8.15513 13.6416 7.2726 12.7096 6.58158C12.4906 6.42007 12.2716 6.27007 12.045 6.12707C11.094 5.20354 12.1696 4.44502 12.4186 4.35501C12.6791 4.26101 12.5091 3.938 11.6675 3.942C10.826 3.9455 10.056 4.22751 9.07446 4.60302C8.93096 4.65952 8.77995 4.70052 8.62545 4.73452C7.73492 4.56552 6.80989 4.52802 5.84386 4.63702C4.02481 4.83953 2.57177 5.69955 1.50373 7.1676C0.220694 8.93215 -0.0813148 10.9372 0.288196 13.0283C0.676708 15.2323 1.80174 17.0569 3.53029 18.4834C5.32285 19.9625 7.38741 20.6875 9.74298 20.5485C11.1735 20.466 12.7661 20.2745 14.5626 18.7539C15.0156 18.9795 15.4912 19.0695 16.2797 19.137C16.8872 19.1935 17.4722 19.107 17.9252 19.013C18.6347 18.8629 18.5857 18.2059 18.3292 18.0854C16.2497 17.1169 16.7062 17.5109 16.2912 17.1919C17.3477 15.9419 18.9618 13.7198 19.4598 10.6942C19.5088 10.3602 19.5713 9.88968 19.5638 9.61917C19.5598 9.45417 19.5978 9.39016 19.7863 9.37116C20.3073 9.31116 20.8128 9.16866 21.2773 8.91315C22.6249 8.17713 23.1684 6.96809 23.2964 5.51905C23.3154 5.29754 23.2924 5.06853 23.0584 4.95203ZM11.3165 17.9954C9.30097 16.4109 8.32344 15.8894 7.91992 15.9119C7.54241 15.9344 7.61042 16.3664 7.69342 16.6479C7.78042 16.9259 7.89342 17.1174 8.05193 17.3614C8.16143 17.5229 8.23694 17.7629 7.94243 17.9434C7.29341 18.3449 6.16487 17.8084 6.11187 17.7819C4.79833 17.0084 3.7003 15.9874 2.92628 14.5908C2.17875 13.2468 1.74474 11.8047 1.67324 10.2657C1.65424 9.89418 1.76374 9.76267 2.13375 9.69517C2.62077 9.60517 3.12278 9.58617 3.6093 9.65767C5.66636 9.95818 7.41741 10.8777 8.88545 12.3348C9.72348 13.1643 10.3575 14.1558 11.0105 15.1243C11.705 16.1529 12.4521 17.1329 13.4036 17.9364C13.7396 18.2179 14.0076 18.4319 14.2641 18.5899C13.4906 18.6764 12.1996 18.6949 11.3165 17.9964V17.9954ZM12.2826 11.7817C12.2826 11.6167 12.4146 11.4852 12.5806 11.4852C12.6181 11.4852 12.6521 11.4927 12.6826 11.5037C12.7241 11.5187 12.7621 11.5412 12.7921 11.5752C12.8451 11.6277 12.8751 11.7027 12.8751 11.7817C12.8751 11.9467 12.7431 12.0782 12.5771 12.0782C12.4111 12.0782 12.2826 11.9467 12.2826 11.7817ZM15.2831 13.3208C15.0906 13.3998 14.8981 13.4673 14.7131 13.4748C14.4261 13.4898 14.1131 13.3733 13.9431 13.2308C13.6791 13.0093 13.4901 12.8853 13.4111 12.4988C13.3771 12.3338 13.3961 12.0782 13.4261 11.9317C13.4941 11.6162 13.4186 11.4137 13.1961 11.2297C13.0151 11.0797 12.7846 11.0382 12.5316 11.0382C12.4371 11.0382 12.3506 10.9967 12.2861 10.9632C12.1806 10.9107 12.0936 10.7792 12.1766 10.6177C12.2031 10.5652 12.3316 10.4377 12.3616 10.4152C12.7051 10.2197 13.1011 10.2837 13.4676 10.4302C13.8071 10.5692 14.0641 10.8242 14.4336 11.1847C14.8111 11.6202 14.8791 11.7402 15.0941 12.0672C15.2641 12.3228 15.4186 12.5853 15.5247 12.8858C15.5887 13.0733 15.5057 13.2268 15.2831 13.3208Z"
		];
		const LOCKUP_VIEWBOX = "0 0 124 37";
		const LOCKUP_PATHS = [
		{
		"fill": "#111111",
		"d": "M96.3279 9.31738C97.8788 9.31746 99.2824 9.70301 100.55 10.4697L100.555 10.4736L100.562 10.4766C101.052 10.7544 101.504 11.0807 101.917 11.4561V9.33301H105.602V27.9609C105.602 29.6426 105.243 31.1479 104.515 32.4668C103.787 33.8096 102.739 34.8583 101.377 35.6074C100.034 36.3579 98.4731 36.7265 96.7059 36.7266C94.3002 36.7266 92.2675 36.1584 90.6307 34.999C89.2257 34.0038 88.3094 32.6927 87.8875 31.0801L91.2322 29.8496L91.3162 30.084C91.6082 31.0573 92.2004 31.8442 93.1092 32.4492L93.199 32.5078L93.201 32.5088L93.2029 32.5107C94.1615 33.1429 95.324 33.4668 96.7059 33.4668C98.2609 33.4668 99.498 32.9821 100.449 32.0312L100.451 32.0303L100.452 32.0283C101.415 31.085 101.917 29.7454 101.917 27.9609V26.1025C101.501 26.4878 101.048 26.8267 100.555 27.1182C99.2869 27.8538 97.8815 28.2245 96.3279 28.2246C94.775 28.2246 93.3695 27.8542 92.1024 27.1191C90.8398 26.3543 89.8271 25.2671 89.0652 23.8438C88.3078 22.3959 87.9198 20.6853 87.9197 18.6973C87.9198 16.7432 88.3066 15.0672 89.0623 13.6533C89.8242 12.2281 90.8367 11.1573 92.0975 10.4248C93.3659 9.68797 94.7731 9.31744 96.3279 9.31738ZM42.5164 11.5977C43.0572 11.004 43.7111 10.5195 44.4754 10.1455H44.4774L44.4783 10.1445C45.5924 9.6107 46.8293 9.34668 48.1815 9.34668C49.6037 9.34675 50.899 9.65673 52.0594 10.2822L52.1688 10.3408C53.2891 10.9508 54.1646 11.8578 54.7947 13.0498C55.4697 14.2848 55.7986 15.7719 55.7986 17.4961V28.2217H52.119V17.9277C52.1189 16.1673 51.6784 14.882 50.8524 14.0156L50.8514 14.0146L50.8504 14.0127C50.02 13.1216 48.8782 12.6621 47.3836 12.6621C45.8683 12.6622 44.6914 13.1329 43.8152 14.0498C42.9675 14.9602 42.5165 16.3114 42.5164 18.1602V28.2217H38.8035V2.95801H42.5164V11.5977ZM63.3387 28.2197H59.6248V9.33203H63.3387V28.2197ZM116.607 9.31738C118.683 9.31739 120.395 9.8262 121.713 10.874C122.806 11.7436 123.475 12.8799 123.728 14.2617L120.14 15.5254L120.118 15.2129C120.058 14.378 119.712 13.725 119.081 13.2285L119.079 13.2266L119.077 13.2256C118.47 12.7322 117.626 12.4668 116.508 12.4668C115.468 12.4668 114.683 12.6826 114.118 13.0791C113.56 13.4706 113.298 13.9626 113.298 14.5781C113.298 15.077 113.455 15.473 113.762 15.79C114.123 16.1192 114.57 16.3957 115.106 16.6162C115.691 16.8254 116.498 17.069 117.531 17.3457C118.846 17.691 119.925 18.0389 120.765 18.3906C121.634 18.7327 122.375 19.2566 122.984 19.959L123.046 20.0293C123.667 20.7558 123.977 21.6819 124 22.7803V22.7871C124 23.8193 123.703 24.7556 123.107 25.5859C122.513 26.415 121.674 27.0624 120.607 27.5342L120.603 27.5361C119.554 27.9877 118.353 28.2089 117.007 28.209C115.572 28.209 114.273 27.9774 113.116 27.5068L113.113 27.5059L113.111 27.5039C111.958 27.0123 111.032 26.3362 110.349 25.4697L110.347 25.4678L110.346 25.4658C109.858 24.8295 109.543 24.1893 109.368 23.4268L113.002 22.1465L113.03 22.3682C113.109 23.1508 113.478 23.7863 114.157 24.29C114.857 24.7931 115.786 25.0595 116.972 25.0596C118.077 25.0596 118.903 24.8223 119.488 24.3877C120.075 23.9517 120.349 23.4245 120.349 22.7871C120.349 22.4518 120.273 22.1781 120.134 21.9541C119.994 21.73 119.778 21.5358 119.47 21.377L119.466 21.375L119.463 21.373C118.794 21.0089 117.733 20.642 116.257 20.2793H116.255L116.254 20.2783C114.894 19.9329 113.77 19.5854 112.887 19.2344L112.882 19.2324L112.876 19.2305C111.987 18.8454 111.216 18.2897 110.563 17.5674L110.559 17.5635L110.556 17.5586C109.896 16.777 109.58 15.7736 109.58 14.5781C109.58 13.6051 109.881 12.7108 110.475 11.9043C111.07 11.0975 111.909 10.4726 112.973 10.0234C114.045 9.54976 115.259 9.3174 116.607 9.31738ZM76.326 9.31738C78.6155 9.31746 80.5002 10.0189 81.9471 11.4424C83.4052 12.8547 84.1092 14.882 84.1092 17.4668V28.208H80.4295V17.8984C80.4295 16.1381 79.9898 14.8528 79.1639 13.9863L79.1609 13.9834C78.3307 13.0924 77.1896 12.6319 75.6951 12.6318C74.1796 12.6318 73.0021 13.1025 72.1258 14.0195C71.2779 14.93 70.827 16.2818 70.827 18.1309V28.208H67.1141V9.31934H70.827V11.5645C71.3615 10.9734 72.0038 10.4907 72.7508 10.1172H72.7518L72.7537 10.1162C73.8447 9.58236 75.0375 9.31739 76.326 9.31738ZM29.1346 9.35059H34.8494V13.0488H29.201L29.1346 21.5283C29.1346 22.8037 29.3827 23.6758 29.8777 24.1445C30.373 24.5871 30.9338 24.8085 31.5594 24.8086C31.8461 24.8086 32.2313 24.7913 32.492 24.7393C33.0205 24.6086 33.7877 24.2487 34.0223 24.1445L35.0174 27.209C34.0789 27.5474 33.0485 28.1679 31.0125 28.168C29.4484 28.168 28.0055 27.686 26.9627 26.7227C25.946 25.7593 25.4244 24.4185 25.3983 22.7002V2.95801H29.1346V9.35059ZM96.7303 12.5869C95.787 12.587 94.9334 12.8295 94.1639 13.3115C93.399 13.7907 92.7843 14.4905 92.3221 15.4229C91.8635 16.3478 91.6288 17.4444 91.6287 18.7227C91.6287 20.0231 91.8645 21.1427 92.324 22.0898C92.7861 23.0208 93.4001 23.7321 94.1658 24.2324C94.9347 24.7133 95.7881 24.956 96.7303 24.9561C97.6728 24.956 98.5257 24.7126 99.2947 24.2314C100.081 23.7305 100.704 23.0197 101.166 22.0898C101.626 21.1419 101.86 20.0331 101.86 18.7549C101.86 17.4765 101.625 16.3801 101.167 15.4551C100.706 14.5247 100.083 13.8244 99.2986 13.3447L99.2957 13.3428L99.2918 13.3408C98.523 12.8392 97.6712 12.587 96.7303 12.5869ZM63.3279 6.70898H59.577V2.95801H63.3279V6.70898Z"
		},
		{
		"fill": "#111111",
		"d": "M0.28059 5.33081C0.15964 5.33081 0.0867676 5.46481 0.152507 5.56634L14.7136 28.0539C14.7604 28.1262 14.8408 28.1699 14.927 28.1699H19.5164C19.6371 28.1699 19.7101 28.0364 19.6448 27.9349L5.19632 5.44765C5.14953 5.37483 5.06892 5.33081 4.98236 5.33081H0.28059Z"
		},
		{
		"fill": "#0068B7",
		"d": "M11.3051 11.6762C11.2998 11.668 11.2996 11.6575 11.3046 11.6492L18.2491 0.123072C18.2951 0.0466971 18.3777 0 18.4669 0H23.4708C23.5923 0 23.6651 0.135144 23.5982 0.236597L13.6827 15.2718C13.6726 15.2871 13.6501 15.287 13.6401 15.2716L11.3051 11.6762Z"
		},
		{
		"fill": "#0068B7",
		"d": "M0.331492 28.1615C0.210142 28.1615 0.137346 28.0267 0.203893 27.9253L6.46083 18.3843C6.47083 18.369 6.49317 18.3689 6.50327 18.3841L8.90401 21.9937C8.90946 22.0019 8.90969 22.0125 8.90459 22.0209L5.2665 28.0388C5.22044 28.115 5.1379 28.1615 5.04887 28.1615H0.331492Z"
		}
		];

		const CSS = `
.xtb-brandLine{position:relative;display:flex;align-items:center;height:24px;overflow:visible;min-width:0}
.xtb-brandWord{display:block;height:18px;width:auto;flex:none;color:var(--dsw-alias-label-primary,#0f1115)}
.xtb-brandByline{position:absolute;left:0;top:24px;font-size:11px;line-height:12px;font-weight:500;color:#61666b;letter-spacing:.01em;white-space:nowrap;background:none;border:0;padding:0;margin:0;font-family:inherit;cursor:pointer;border-radius:3px}
.xtb-brandByline:hover{color:#0068b7}
.xtb-brandByline:focus-visible{outline:2px solid #0068b7;outline-offset:2px}
/* The shipped label is a fixed 24 px box whose wrapper clips its overflow, and the
   byline hangs one line below that box. Let the wrapper spill — but only while our
   byline is mounted, and only for the wrapper itself: the class suffix match
   survives the app rehashing its css-module names, and if it ever stops matching
   nothing breaks, the byline is simply hidden and the stock brand stays identical. */
[class*="_brand"]:has(> [class*="_brandIdentity"] .xtb-brandLine){overflow:visible}
.xtb-overlay{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(15,17,21,.44);pointer-events:auto;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",Helvetica,Arial,sans-serif;color:var(--dsw-alias-label-primary,#0f1115);text-align:left}
.xtb-card{position:relative;width:100%;max-width:520px;max-height:calc(100vh - 48px);overflow:auto;background:#fff;border-radius:16px;box-shadow:0 24px 64px rgba(15,17,21,.18);padding:32px;box-sizing:border-box}
.xtb-head{display:flex;align-items:center;justify-content:space-between;gap:16px}
.xtb-lockup{display:block;width:auto;flex:none}
.xtb-steps{display:flex;align-items:center;gap:12px;font-size:12px;line-height:18px;flex:none}
.xtb-stepItem{display:inline-flex;align-items:center;gap:5px;color:#b6bac0}
.xtb-stepItem-current{color:var(--dsw-alias-label-primary,#0f1115);font-weight:500}
.xtb-stepItem-done{color:#0068B7}
.xtb-stepDot{display:block;width:6px;height:6px;border-radius:3px;background:currentColor;flex:none}
.xtb-stepCheck{display:block;width:10px;height:10px;flex:none}
.xtb-h1{margin:28px 0 0;font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.01em}
.xtb-lede{margin:8px 0 0;font-size:14px;line-height:22px;color:var(--dsw-alias-label-secondary,#61666b)}
.xtb-field{margin-top:20px}
.xtb-labelRow{display:flex;align-items:center;justify-content:space-between;gap:8px}
.xtb-label{display:block;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#61666b)}
.xtb-chip{padding:1px 6px;border-radius:4px;background:#ebeef2;font-size:11px;line-height:14px;color:#61666b;flex:none}
.xtb-inputRow{display:flex;align-items:center;gap:8px;margin-top:6px;height:56px;padding:0 8px 0 14px;border:1px solid #d8dbe0;border-radius:8px;background:#fff;box-sizing:border-box}
.xtb-inputRow:focus-within{border-color:#0068B7;box-shadow:0 0 0 3px rgba(0,104,183,.16)}
.xtb-inputRow-error{border-color:#c2410c}
.xtb-inputRow-error:focus-within{border-color:#c2410c;box-shadow:0 0 0 3px rgba(194,65,12,.14)}
.xtb-input{flex:1;min-width:0;height:100%;padding:0;border:0;outline:0;background:transparent;font:inherit;font-size:14px;color:inherit}
.xtb-input::placeholder{color:#9aa0a8}
.xtb-toggle{flex:none;height:32px;padding:0 10px;border:1px solid rgba(0,0,0,.12);border-radius:6px;background:#fff;color:var(--dsw-alias-label-secondary,#61666b);font:inherit;font-size:12px;cursor:pointer}
.xtb-toggle:hover:not(:disabled){background:#f7f8fa}
.xtb-toggle:disabled{opacity:.5;cursor:default}
.xtb-readonly{margin-top:6px;height:44px;display:flex;align-items:center;padding:0 14px;border:1px solid #e6e8ec;border-radius:8px;background:#f7f8fa;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}
.xtb-hint{margin:6px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#61666b)}
.xtb-error{margin:8px 0 0;min-height:18px;font-size:12px;line-height:18px;color:#c2410c}
.xtb-actions{margin-top:24px;display:flex;flex-direction:column;align-items:stretch;gap:8px}
.xtb-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 18px;border:0;border-radius:8px;background:#0f1115;color:#fff;font:inherit;font-size:14px;font-weight:500;cursor:pointer}
.xtb-primary:hover:not(:disabled){background:#22262e}
.xtb-primary:disabled{opacity:.55;cursor:default}
.xtb-secondary{height:40px;padding:0;border:0;background:transparent;color:var(--dsw-alias-label-secondary,#61666b);font:inherit;font-size:13px;cursor:pointer}
.xtb-secondary:hover:not(:disabled){color:var(--dsw-alias-label-primary,#0f1115)}
.xtb-secondary:disabled{opacity:.55;cursor:default}
.xtb-spinner{display:block;width:12px;height:12px;flex:none;border-radius:6px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:xtb-spin .8s linear infinite}
.xtb-spinner-ink{border-color:rgba(15,17,21,.18);border-top-color:#0f1115}
.xtb-rowSpinner{display:block;width:12px;height:12px;flex:none;border-radius:6px;border:2px solid rgba(15,17,21,.16);border-top-color:#61666b;animation:xtb-spin .8s linear infinite}
@keyframes xtb-spin{to{transform:rotate(360deg)}}
.xtb-rows{margin-top:20px;display:flex;flex-direction:column;gap:10px}
.xtb-row{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:1px solid rgba(0,0,0,.1);border-radius:12px;box-sizing:border-box}
.xtb-row-installed{background:#fcfcfd}
.xtb-rowMain{flex:1;min-width:0}
.xtb-rowTitle{display:flex;align-items:center;gap:6px;font-size:14px;line-height:22px;font-weight:500;font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.xtb-rowNote{margin:2px 0 0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary,#61666b)}
.xtb-rowError{margin:6px 0 0;font-size:12px;line-height:18px;color:#c2410c;word-break:break-word}
.xtb-rowState{display:inline-flex;align-items:center;gap:5px;flex:none;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary,#61666b)}
.xtb-rowState-ok{color:#0068B7}
.xtb-rowState-fail{color:#c2410c}
.xtb-check{display:block;width:13px;height:13px;flex:none}
.xtb-retry{align-self:flex-start;margin-top:6px;padding:0;border:0;background:transparent;color:#0f1115;font:inherit;font-size:12px;line-height:18px;text-decoration:underline;text-underline-offset:2px;cursor:pointer}
.xtb-doneMark{display:block;width:44px;height:44px;flex:none;color:#0068B7;margin-top:4px}
.xtb-summary{margin-top:24px;border:1px solid rgba(0,0,0,.1);border-radius:12px;overflow:hidden}
.xtb-summaryRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;font-size:13px;line-height:20px}
.xtb-summaryRow+.xtb-summaryRow{border-top:1px solid rgba(0,0,0,.06)}
.xtb-summaryLabel{color:var(--dsw-alias-label-secondary,#61666b);flex:none}
.xtb-summaryValue{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.xtb-foot{margin:16px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#61666b)}
`;

		const ZH = {
			"meta.lang": "zh",
			"brand.byline": "Powered by Xthings",
			"steps.connect": "连接",
			"steps.plugins": "插件",
			"steps.done": "完成",
			"step1.title": "连接 Xthings",
			"step1.body": "第一次使用，需要把 Xthings 的访问密钥填进来。每人一把，只存在这台设备上。",
			"step1.keyLabel": "访问密钥",
			"step1.keyPlaceholder": "粘贴 Xthings Key",
			"step1.pasteHint": "直接粘贴即可，只保存在本机。",
			"step1.show": "显示",
			"step1.hide": "隐藏",
			"step1.baseLabel": "接口地址",
			"step1.baseAuto": "已自动填写",
			"step1.submit": "连接并继续",
			"step1.busy": "正在连接…",
			"step1.later": "稍后再说",
			"error.empty": "请先粘贴 Key",
			"error.invalidKey": "Key 无效或已过期，请向管理员确认",
			"error.unreachable": "连不上 Xthings，检查网络后重试",
			"error.config": "保存失败，请重试",
			"step2.title": "安装必备插件",
			"step2.body": "都来自开源仓库，走 DeepSeek Harness 官方安装器。点「安装」就行，装完自动启用。",
			"step2.installed": "已安装",
			"step2.missing": "未安装",
			"step2.running": "安装中",
			"step2.submit": "安装并继续",
			"step2.submitContinue": "继续",
			"step2.nothingMissing": "必备插件都已经装好了。",
			"step2.retry": "重试",
			"step2.restart": "已安装，重启后生效",
			"step2.failed": "安装失败",
			"step2.busy": "正在安装…",
			"step3.title": "一切就绪",
			"step3.body": "下面三件都确认过了，直接开始用。",
			"step3.provider": "模型通道",
			"step3.key": "访问密钥",
			"step3.saved": "已保存",
			"step3.plugins": "必备插件",
			"step3.pluginsCount": "{n} 个已就绪",
			"step3.ready": "就绪",
			"step3.submit": "开始使用",
			"step3.foot": "引导不会再自动出现。以后要换 Key，点侧边栏的「Powered by Xthings」。",
			"brand.settings": "Xthings 设置",
			"step2.later": "稍后再说"
		};

		const EN = {
			"meta.lang": "en",
			"brand.byline": "Powered by Xthings",
			"steps.connect": "Connect",
			"steps.plugins": "Plugins",
			"steps.done": "Done",
			"step1.title": "Connect Xthings",
			"step1.body": "First run needs your Xthings access key. One key per person, stored on this device only.",
			"step1.keyLabel": "Access key",
			"step1.keyPlaceholder": "Paste your Xthings key",
			"step1.pasteHint": "Paste it straight in. It stays on this machine.",
			"step1.show": "Show",
			"step1.hide": "Hide",
			"step1.baseLabel": "Endpoint",
			"step1.baseAuto": "Filled in",
			"step1.submit": "Connect and continue",
			"step1.busy": "Connecting…",
			"step1.later": "Later",
			"error.empty": "Paste a key first",
			"error.invalidKey": "This key is invalid or expired. Ask your administrator.",
			"error.unreachable": "Cannot reach Xthings. Check your network and retry.",
			"error.config": "Could not save the key. Try again.",
			"step2.title": "Install the required plugins",
			"step2.body": "Both come from open repositories and install through the official DeepSeek Harness installer. Press install — they switch on as they land.",
			"step2.installed": "Installed",
			"step2.missing": "Not installed",
			"step2.running": "Installing",
			"step2.submit": "Install and continue",
			"step2.submitContinue": "Continue",
			"step2.nothingMissing": "Every required plugin is already installed.",
			"step2.retry": "Retry",
			"step2.restart": "Installed, active after a restart",
			"step2.failed": "Install failed",
			"step2.busy": "Installing…",
			"step3.title": "You are all set",
			"step3.body": "All three checks passed. Start working.",
			"step3.provider": "Model channel",
			"step3.key": "Access key",
			"step3.saved": "Saved",
			"step3.plugins": "Required plugins",
			"step3.pluginsCount": "{n} ready",
			"step3.ready": "Ready",
			"step3.submit": "Start",
			"step3.foot": "This guide will not open by itself again. To change the key later, click “Powered by Xthings” in the sidebar.",
			"brand.settings": "Xthings settings",
			"step2.later": "Later"
		};

		/** Bound per apply(); components read it during render. */
		let t = (key) => key;

		function installStyle() {
			if (typeof document === "undefined" || document.head === null || document.head === undefined) return;
			if (document.getElementById(STYLE_ID) !== null) return;
			const element = document.createElement("style");
			element.id = STYLE_ID;
			element.textContent = CSS;
			document.head.appendChild(element);
		}

		function readSession(key) {
			try {
				return window.sessionStorage.getItem(key);
			} catch (error) {
				return null;
			}
		}

		function writeSession(key, value) {
			try {
				window.sessionStorage.setItem(key, value);
			} catch (error) {
				/* storage can be denied; the wizard still works for this mount */
			}
		}

		function endpointOf(path) {
			return new URL(path, document.baseURI).pathname;
		}

		/**
		 * The launch animation owns the whole window and sits above the shell, so the guide
		 * must not mount until it has left the page. The splash announces itself with an
		 * event; the element poll covers a splash that was patched away or replaced.
		 */
		function splashOnScreen() {
			if (typeof document === "undefined") return false;
			/* The element is the truth: splash.js mounts it synchronously and removes it
			   when the animation is done, while its global API object outlives the node. */
			return document.getElementById("xthings-splash") !== null;
		}

		function useSplashGone() {
			const [gone, setGone] = react.useState(() => !splashOnScreen());
			react.useEffect(() => {
				if (!splashOnScreen()) {
					setGone(true);
					return undefined;
				}
				let settled = false;
				let watchdog = 0;
				let poll = 0;
				const finish = () => {
					if (settled) return;
					settled = true;
					window.clearTimeout(watchdog);
					window.clearInterval(poll);
					window.removeEventListener("xthings:splash-done", finish);
					setGone(true);
				};
				watchdog = window.setTimeout(finish, 9600);
				poll = window.setInterval(() => {
					if (!splashOnScreen()) finish();
				}, 250);
				window.addEventListener("xthings:splash-done", finish);
				return () => {
					settled = true;
					window.clearTimeout(watchdog);
					window.clearInterval(poll);
					window.removeEventListener("xthings:splash-done", finish);
				};
			}, []);
			return gone;
		}

		async function readStatus() {
			try {
				const response = await fetch(endpointOf("xthings-brand/status"), {
					method: "GET",
					credentials: "same-origin",
					cache: "no-store",
					headers: { accept: "application/json" }
				});
				if (!response.ok) return null;
				const body = await response.json();
				return body !== null && typeof body === "object" ? body : null;
			} catch (error) {
				return null;
			}
		}

		async function postJSON(path, payload) {
			try {
				const response = await fetch(endpointOf(path), {
					method: "POST",
					credentials: "same-origin",
					cache: "no-store",
					headers: { "content-type": "application/json", accept: "application/json" },
					body: JSON.stringify(payload)
				});
				const body = await response.json().catch(() => null);
				if (body !== null && typeof body === "object") return body;
				return { ok: false, code: "unreachable" };
			} catch (error) {
				return { ok: false, code: "unreachable" };
			}
		}

		function listOf(status) {
			return status !== null && Array.isArray(status.recommended) ? status.recommended : [];
		}

		function keyReady(status) {
			const credential = status !== null && status.credential !== null && typeof status.credential === "object" ? status.credential : {};
			const provider = status !== null && status.provider !== null && typeof status.provider === "object" ? status.provider : {};
			return credential.present === true || provider.configured === true;
		}

		function pluginsReady(status) {
			return listOf(status).every((item) => item !== null && typeof item === "object" && item.installed === true);
		}

		/** Verified resume position: never opens on a step the Host says is already done. */
		function resumeStep(status) {
			if (!keyReady(status)) return 1;
			return pluginsReady(status) ? 3 : 2;
		}

		function localeOf(item, field, fallback) {
			const bag = item !== null && typeof item === "object" ? item[field] : null;
			if (bag === null || typeof bag !== "object") return fallback;
			const lang = t("meta.lang") === "en" ? "en" : "zh";
			const value = typeof bag[lang] === "string" && bag[lang] !== "" ? bag[lang] : bag.zh;
			return typeof value === "string" && value !== "" ? value : fallback;
		}

		function CheckMark({ className }) {
			return jsx("svg", {
				className: className,
				viewBox: "0 0 12 12",
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: jsx("path", {
					d: "M2.2 6.4 4.7 8.9 9.9 3.3",
					stroke: "currentColor",
					strokeWidth: 1.8,
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}

		function CrossMark({ className }) {
			return jsx("svg", {
				className: className,
				viewBox: "0 0 12 12",
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: jsx("path", {
					d: "M3 3 9 9M9 3 3 9",
					stroke: "currentColor",
					strokeWidth: 1.6,
					strokeLinecap: "round"
				})
			});
		}

		function XthingsLockup({ height }) {
			return jsx("svg", {
				className: "xtb-lockup",
				viewBox: LOCKUP_VIEWBOX,
				role: "img",
				"aria-label": "Xthings",
				focusable: "false",
				style: { height: `${height}px` },
				children: LOCKUP_PATHS.map((path, index) => jsx("path", { d: path.d, fill: path.fill }, `l${index}`))
			});
		}

		function DeepSeekWordmark() {
			return jsx("svg", {
				className: "xtb-brandWord",
				viewBox: WORDMARK_VIEWBOX,
				"aria-hidden": "true",
				focusable: "false",
				children: WORDMARK_PATHS.map((path, index) => jsx("path", { d: path, fill: "currentColor" }, `w${index}`))
			});
		}

		function BigCheck() {
			return jsxs("svg", {
				className: "xtb-doneMark",
				viewBox: "0 0 44 44",
				fill: "none",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					jsx("circle", { cx: 22, cy: 22, r: 20.5, stroke: "currentColor", strokeWidth: 2, opacity: 0.28 }),
					jsx("path", {
						d: "M13.4 22.8 19.4 28.8 30.8 17.2",
						stroke: "currentColor",
						strokeWidth: 2.6,
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})
				]
			});
		}

		function StepIndicator({ step }) {
			const labels = [t("steps.connect"), t("steps.plugins"), t("steps.done")];
			return jsx("div", {
				className: "xtb-steps",
				children: labels.map((label, index) => {
					const number = index + 1;
					const done = number < step;
					const current = number === step;
					const className = `xtb-stepItem${current ? " xtb-stepItem-current" : done ? " xtb-stepItem-done" : ""}`;
					return jsxs(
						"span",
						{
							className: className,
							children: [
								done ? jsx(CheckMark, { className: "xtb-stepCheck" }) : jsx("span", { className: "xtb-stepDot", "aria-hidden": "true" }),
								jsx("span", { children: label })
							]
						},
						`s${number}`
					);
				})
			});
		}

		function PrimaryButton({ label, onClick, disabled, spinning }) {
			return jsxs("button", {
				type: "button",
				className: "xtb-primary",
				onClick: disabled === true ? undefined : onClick,
				disabled: disabled === true,
				"aria-busy": spinning === true ? "true" : undefined,
				children: [
					spinning === true ? jsx("span", { className: "xtb-spinner", "aria-hidden": "true" }) : null,
					jsx("span", { children: label })
				]
			});
		}

		/** sidebar.brand.name: the wordmark plus a single Xthings byline — the only place the name appears. */
		function XthingsBrandName() {
			return jsxs("div", {
				className: "xtb-brandLine",
				children: [
					jsx(DeepSeekWordmark, {}),
					jsx("button", {
						type: "button",
						className: "xtb-brandByline",
						title: t("brand.settings"),
						"aria-label": t("brand.settings"),
						onClick: (event) => {
							// The label may itself be a button (Windows renders it as
							// 新建会话): never let the guide steal that click.
							try {
								event.stopPropagation();
							} catch (error) {
								/* no event object: nothing to stop */
							}
							openWizard();
						},
						children: t("brand.byline")
					})
				]
			});
		}

		/** The byline is the quiet way back into the guide once it has finished. */
		const WIZARD_OPEN = "xthings:wizard-open";

		function openWizard() {
			try {
				window.dispatchEvent(new CustomEvent(WIZARD_OPEN));
			} catch (error) {
				/* an event dispatch that fails simply leaves the guide closed */
			}
		}

		function ConnectStep({ value, visible, busy, error, baseURL, inputRef, onChange, onToggle, onSubmit, onLater }) {
			return jsxs("div", {
				children: [
					jsx("h2", { className: "xtb-h1", id: TITLE_ID, children: t("step1.title") }),
					jsx("p", { className: "xtb-lede", children: t("step1.body") }),
					jsxs("div", {
						className: "xtb-field",
						children: [
							jsx("label", { className: "xtb-label", htmlFor: KEY_ID, children: t("step1.keyLabel") }),
							jsxs("div", {
								className: `xtb-inputRow${error === null ? "" : " xtb-inputRow-error"}`,
								children: [
									jsx("input", {
										id: KEY_ID,
										ref: inputRef,
										className: "xtb-input",
										type: visible ? "text" : "password",
										value: value,
										placeholder: t("step1.keyPlaceholder"),
										autoComplete: "off",
										spellCheck: false,
										disabled: busy,
										"aria-invalid": error === null ? undefined : "true",
										"aria-describedby": HINT_ID,
										onChange: (event) => onChange(event.target.value)
									}),
									jsx("button", {
										type: "button",
										className: "xtb-toggle",
										onClick: onToggle,
										disabled: busy,
										children: visible ? t("step1.hide") : t("step1.show")
									})
								]
							})
						]
					}),
					jsx("p", { className: "xtb-hint", id: HINT_ID, children: t("step1.pasteHint") }),
					jsxs("div", {
						className: "xtb-field",
						children: [
							jsxs("div", {
								className: "xtb-labelRow",
								children: [
									jsx("span", { className: "xtb-label", children: t("step1.baseLabel") }),
									jsx("span", { className: "xtb-chip", children: t("step1.baseAuto") })
								]
							}),
							jsx("div", { className: "xtb-readonly", children: baseURL === "" ? DEFAULT_BASE : baseURL })
						]
					}),
					jsx("p", { className: "xtb-error", role: "status", "aria-live": "polite", children: error === null ? "" : t(error) }),
					jsxs("div", {
						className: "xtb-actions",
						children: [
							jsx(PrimaryButton, {
								label: busy ? t("step1.busy") : t("step1.submit"),
								onClick: onSubmit,
								disabled: busy,
								spinning: busy
							}),
							jsx("button", {
								type: "button",
								className: "xtb-secondary",
								onClick: onLater,
								disabled: busy,
								children: t("step1.later")
							})
						]
					})
				]
			});
		}

		function stateOf(row) {
			return row !== null && row !== undefined && typeof row.state === "string" ? row.state : "idle";
		}

		function PluginRow({ item, row, onRetry }) {
			const state = stateOf(row);
			const installed = item.installed === true || state === "ok" || state === "restart";
			const failed = state === "failed";
			const running = state === "running";
			let indicator = null;
			let text = item.installed === true ? t("step2.installed") : t("step2.missing");
			let tone = "";
			if (running) {
				indicator = jsx("span", { className: "xtb-rowSpinner", "aria-hidden": "true" });
				text = t("step2.running");
			} else if (state === "ok" || item.installed === true) {
				indicator = jsx(CheckMark, { className: "xtb-check" });
				text = t("step2.installed");
				tone = " xtb-rowState-ok";
			} else if (state === "restart") {
				indicator = jsx(CheckMark, { className: "xtb-check" });
				text = t("step2.restart");
				tone = " xtb-rowState-ok";
			} else if (failed) {
				indicator = jsx(CrossMark, { className: "xtb-check" });
				text = t("step2.failed");
				tone = " xtb-rowState-fail";
			}
			const badge = localeOf(item, "title", "");
			return jsxs("div", {
				className: `xtb-row${installed ? " xtb-row-installed" : ""}`,
				children: [
					jsxs("div", {
						className: "xtb-rowMain",
						children: [
							jsxs("div", {
								className: "xtb-rowTitle",
								children: [
									jsx("span", { children: item.name }),
									badge === "" || badge === item.name ? null : jsx("span", { className: "xtb-chip", children: badge })
								]
							}),
							jsx("p", { className: "xtb-rowNote", children: localeOf(item, "note", "") }),
							failed ? jsx("p", { className: "xtb-rowError", children: row.message === null || row.message === undefined || row.message === "" ? t("step2.failed") : String(row.message) }) : null,
							failed ? jsx("button", { type: "button", className: "xtb-retry", onClick: onRetry, children: t("step2.retry") }) : null
						]
					}),
					jsxs("span", { className: `xtb-rowState${tone}`, children: [indicator, jsx("span", { children: text })] })
				]
			});
		}

		function PluginsStep({ items, rows, installing, onInstall, onRetry, onLater }) {
			const missing = items.filter((item) => item.installed !== true && stateOf(rows[item.id]) !== "ok" && stateOf(rows[item.id]) !== "restart");
			return jsxs("div", {
				children: [
					jsx("h2", { className: "xtb-h1", id: TITLE_ID, children: t("step2.title") }),
					jsx("p", { className: "xtb-lede", children: t("step2.body") }),
					jsx("div", {
						className: "xtb-rows",
						children: items.map((item) =>
							jsx(PluginRow, { item: item, row: rows[item.id], onRetry: onInstall }, item.id)
						)
					}),
					missing.length === 0 ? jsx("p", { className: "xtb-hint", children: t("step2.nothingMissing") }) : null,
					jsxs("div", {
						className: "xtb-actions",
						children: [
							jsx(PrimaryButton, {
								label: missing.length === 0 ? t("step2.submitContinue") : installing ? t("step2.busy") : t("step2.submit"),
								onClick: onInstall,
								disabled: installing,
								spinning: installing
							}),
							jsx("button", {
								type: "button",
								className: "xtb-secondary",
								onClick: onLater,
								disabled: installing,
								children: t("step2.later")
							})
						]
					})
				]
			});
		}

		function DoneStep({ provider, readyCount, onFinish }) {
			const rows = [
				{ key: "provider", label: t("step3.provider"), value: provider === "" ? "xthings" : provider },
				{ key: "key", label: t("step3.key"), value: t("step3.saved") },
				{ key: "plugins", label: t("step3.plugins"), value: t("step3.pluginsCount", { n: readyCount }) }
			];
			return jsxs("div", {
				children: [
					jsx(BigCheck, {}),
					jsx("h2", { className: "xtb-h1", id: TITLE_ID, children: t("step3.title") }),
					jsx("p", { className: "xtb-lede", children: t("step3.body") }),
					jsx("div", {
						className: "xtb-summary",
						children: rows.map((row) =>
							jsxs(
								"div",
								{
									className: "xtb-summaryRow",
									children: [
										jsx("span", { className: "xtb-summaryLabel", children: row.label }),
										jsx("span", { className: "xtb-summaryValue", children: row.value })
									]
								},
								row.key
							)
						)
					}),
					jsxs("div", {
						className: "xtb-actions",
						children: [
							jsx(PrimaryButton, { label: t("step3.submit"), onClick: onFinish, disabled: false, spinning: false }),
							jsx("p", { className: "xtb-foot", children: t("step3.foot") })
						]
					})
				]
			});
		}

		function XthingsOnboarding() {
			const splashGone = useSplashGone();
			const [view, setView] = react.useState("pending");
			const [status, setStatus] = react.useState(null);
			const [step, setStep] = react.useState(1);
			const [key, setKey] = react.useState("");
			const [visible, setVisible] = react.useState(false);
			const [error, setError] = react.useState(null);
			const [busy, setBusy] = react.useState(false);
			const [rows, setRows] = react.useState({});
			const [installing, setInstalling] = react.useState(false);
			const keyRef = react.useRef(null);
			const alive = react.useRef(true);

			react.useEffect(() => {
				alive.current = true;
				let cancelled = false;
				readStatus().then((fresh) => {
					if (cancelled || !alive.current) return;
					if (fresh === null) {
						setView("hidden");
						return;
					}
					setStatus(fresh);
					if (readSession("xtb-skip") === "1" || readSession("xtb-done") === "1") {
						setView("hidden");
						return;
					}
					/* Status decides the step: it is the only source that can prove a precondition.
					   A remembered "3" is honoured only while status still backs it up. */
					const required = resumeStep(fresh);
					if (required === 3 && readSession("xtb-step") !== "3") {
						setView("hidden");
						return;
					}
					setStep(required);
					writeSession("xtb-step", String(required));
					setView("open");
				});
				return () => {
					cancelled = true;
					alive.current = false;
				};
			}, []);

			react.useEffect(() => {
				if (view !== "open" || step !== 1 || busy) return;
				const node = keyRef.current;
				if (node !== null && node !== undefined && typeof node.focus === "function") node.focus();
			}, [view, step, busy]);

			/* Reopened from the sidebar byline: always starts at the key, never at a step the
			   remembered session claims is done. */
			react.useEffect(() => {
				const reopen = () => {
					writeSession("xtb-skip", "0");
					writeSession("xtb-done", "0");
					setError(null);
					setKey("");
					setBusy(false);
					setStep(1);
					setView("open");
					readStatus().then((fresh) => {
						if (alive.current && fresh !== null) setStatus(fresh);
					});
				};
				window.addEventListener(WIZARD_OPEN, reopen);
				return () => window.removeEventListener(WIZARD_OPEN, reopen);
			}, []);

			const goTo = (next) => {
				writeSession("xtb-step", String(next));
				setStep(next);
			};

			const patchRow = (id, patch) => {
				setRows((current) => {
					const draft = Object.assign({}, current);
					draft[id] = Object.assign({ state: "idle", message: null }, current[id], patch);
					return draft;
				});
			};

			const rowOf = (id) => (rows[id] === undefined ? { state: "idle", message: null } : rows[id]);

			const close = (reason) => {
				writeSession(reason === "done" ? "xtb-done" : "xtb-skip", "1");
				setView("hidden");
			};

			const submitKey = async () => {
				if (busy) return;
				const value = key.trim();
				if (value === "") {
					setError("error.empty");
					return;
				}
				setBusy(true);
				setError(null);
				const answer = await postJSON("xthings-brand/provision", { key: value });
				if (!alive.current) return;
				if (answer !== null && answer.ok === true) {
					setKey("");
					const fresh = await readStatus();
					if (!alive.current) return;
					if (fresh !== null) setStatus(fresh);
					setBusy(false);
					goTo(2);
					return;
				}
				const code = answer !== null && typeof answer.code === "string" ? answer.code : "unreachable";
				setBusy(false);
				setError(
					code === "invalid-key"
						? "error.invalidKey"
						: code === "bad-request"
							? "error.empty"
							: code === "unreachable"
								? "error.unreachable"
								: "error.config"
				);
			};

			const runInstall = async () => {
				if (installing) return;
				const items = listOf(status);
				const pending = items.filter((item) => item.installed !== true && stateOf(rowOf(item.id)) !== "ok" && stateOf(rowOf(item.id)) !== "restart");
				if (pending.length === 0) {
					goTo(3);
					return;
				}
				setInstalling(true);
				for (const item of pending) {
					patchRow(item.id, { state: "running", message: null });
					const answer = await postJSON("xthings-brand/install", { id: item.id });
					if (!alive.current) return;
					if (answer === null || answer.ok !== true) {
						const message = answer !== null && typeof answer.message === "string" && answer.message !== "" ? answer.message : t("step2.failed");
						patchRow(item.id, { state: "failed", message: message });
						setInstalling(false);
						return;
					}
					const outcome = typeof answer.application === "string" ? answer.application : "applied";
					const message = typeof answer.message === "string" && answer.message !== "" ? answer.message : null;
					if (outcome === "failed") {
						patchRow(item.id, { state: "failed", message: message });
						setInstalling(false);
						return;
					}
					if (outcome === "cancelled") {
						patchRow(item.id, { state: "idle", message: null });
						setInstalling(false);
						return;
					}
					patchRow(item.id, { state: outcome === "restart-required" ? "restart" : "ok", message: message });
				}
				if (!alive.current) return;
				setInstalling(false);
				const fresh = await readStatus();
				if (!alive.current) return;
				if (fresh !== null) setStatus(fresh);
				goTo(3);
			};

			if (view !== "open" || status === null || splashGone !== true) return null;

			const items = listOf(status);
			const provider = status.provider !== null && typeof status.provider === "object" && typeof status.provider.id === "string" ? status.provider.id : "xthings";
			const baseURL = status.provider !== null && typeof status.provider === "object" && typeof status.provider.baseURL === "string" && status.provider.baseURL !== "" ? status.provider.baseURL : DEFAULT_BASE;
			const readyCount = items.filter((item) => item.installed === true || stateOf(rowOf(item.id)) === "ok" || stateOf(rowOf(item.id)) === "restart").length;

			let body = null;
			if (step === 1) {
				body = jsx(ConnectStep, {
					value: key,
					visible: visible,
					busy: busy,
					error: error,
					baseURL: baseURL,
					inputRef: keyRef,
					onChange: (next) => {
						setKey(next);
						if (error !== null) setError(null);
					},
					onToggle: () => setVisible((current) => !current),
					onSubmit: submitKey,
					onLater: () => close("skip")
				});
			} else if (step === 2) {
				body = jsx(PluginsStep, {
					items: items,
					rows: rows,
					installing: installing,
					onInstall: runInstall,
					onRetry: runInstall,
					onLater: () => close("skip")
				});
			} else {
				body = jsx(DoneStep, { provider: provider, readyCount: readyCount, onFinish: () => close("done") });
			}

			const card = jsxs("div", {
				className: "xtb-card",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": TITLE_ID,
				children: [
					jsxs("div", {
						className: "xtb-head",
						children: [jsx(XthingsLockup, { height: 20 }), jsx(StepIndicator, { step: step })]
					}),
					body
				]
			});

			return jsx("div", { className: "xtb-overlay", children: card });
		}

		const inject = ["slots", "locale"];

		function apply(ctx) {
			installStyle();
			ctx.effect(() => {
				try {
					return ctx.locale.register(NS, { zh: ZH, en: EN });
				} catch (error) {
					/* a previous load of this bundle already owns the dictionaries */
					return () => {};
				}
			}, "xthings-brand: dictionaries");
			t = ctx.locale.bind(NS);
			ctx.slots.inject("sidebar.brand.name", () =>
				ctx.slots.register({ name: "sidebar.brand.name", priority: -1 }, XthingsBrandName)
			);
			ctx.slots.inject("shell.overlay", () =>
				ctx.slots.register({ name: "shell.overlay", id: "xthings-onboarding" }, XthingsOnboarding)
			);
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
