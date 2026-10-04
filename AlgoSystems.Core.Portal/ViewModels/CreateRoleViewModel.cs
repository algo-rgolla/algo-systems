using System.ComponentModel.DataAnnotations;

namespace AlgoSystems.Core.Portal.ViewModels
{
    public class CreateRoleViewModel
    {
        [Required]
        public string RoleName { get; set; }
    }
}
