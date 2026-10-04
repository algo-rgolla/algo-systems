namespace AlgoSystems.Core.Portal.Options
{
    public class ApplicationSettings
    {
        public bool EnableHangfire { get; set; }
        public string[] QueuesToProcess { get; set; }

    }
}
