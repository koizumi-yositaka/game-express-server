const PROOF_MESSAGE_CONST = Object.freeze({
  C1: "${0}さんのORDERを完了してもよろしいですか？",
  C2: "TURN ${0}を開始してもよろしいですか？",
  C3: "持っているカードのコードは\n${0}\nで正しいですか？\nこれ違うと崩壊するからお願い間違えないで",

  I1: "TURN ${0}を完了しました",
  I2: "${0}のORDERを完了しました",
  I3: "証拠コードの登録に成功しました",
});

export const getProofMessage = (
  key: keyof typeof PROOF_MESSAGE_CONST,
  ...args: any[]
) => {
  let temp = PROOF_MESSAGE_CONST[key] as string;
  for (let i = 0; i < args.length; i++) {
    temp = temp.replace(`\${${i}}`, args[i]);
  }
  return temp;
};
