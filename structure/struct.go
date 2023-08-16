package structure

type UserParam struct {
	Name    string `json:"name"`
	Score   int    `json:"score"`
	Ranking int    `json:"ranking"`
}

type DataParam struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}
